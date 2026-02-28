# Migração em etapas — Vídeos saindo de `exercise_prescriptions` para `exercise_videos`

## Objetivo

1. **Migrar vínculos legados** de `exercise_prescriptions.video_id` para a nova tabela `exercise_videos`.
2. Garantir a regra: **cada exercício tem apenas 1 vídeo relacionado**.
3. Em uma etapa posterior, **remover `video_id`** de `exercise_prescriptions` (e seus índices/FK).

> Este documento foca primeiro na migração de dados (passo 1) e já inclui os ajustes necessários para 1:1.

---

## Pré-checks (rodar antes)

### 0.1. Quantos registros legados existem?

```sql
select count(*) as prescriptions_with_video
from public.exercise_prescriptions
where video_id is not null;
```

### 0.2. Existem exercícios com MAIS de um vídeo diferente nas prescrições?

Isto é exatamente o trecho que preocupa para o modelo 1 exercício → 1 vídeo.

```sql
select
  exercise_id,
  count(distinct video_id) as distinct_video_count
from public.exercise_prescriptions
where video_id is not null
group by exercise_id
having count(distinct video_id) > 1
order by distinct_video_count desc;
```

Se retornar linhas, você precisa **escolher 1 vídeo canônico** por `exercise_id` ao migrar.

---

## Fase 1 — Migrar dados legados (prescrições → `exercise_videos`) com regra 1:1

### 1.1. (Recomendado) Criar uma tabela de auditoria da decisão de migração

Guarda qual vídeo foi escolhido para cada exercício e o motivo/contagens.

```sql
create table if not exists public.exercise_video_migration_audit (
  exercise_id uuid not null,
  chosen_video_id uuid not null,
  rule text not null,
  chosen_video_count bigint not null,
  chosen_video_last_seen timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (exercise_id)
);
```

### 1.2. Definir a regra de escolha do vídeo por exercício

Sugestão segura (determinística) para escolher 1 vídeo por exercício:

- **1º critério:** o `video_id` **mais frequente** em `exercise_prescriptions` para aquele `exercise_id`
- **desempate:** o `video_id` com `updated_at/created_at` **mais recente** na prescrição
- **desempate final:** menor `video_id` (para determinismo)

```sql
with ranked as (
  select
    ep.exercise_id,
    ep.video_id,
    count(*) as usage_count,
    max(coalesce(ep.updated_at, ep.created_at)) as last_seen,
    row_number() over (
      partition by ep.exercise_id
      order by
        count(*) desc,
        max(coalesce(ep.updated_at, ep.created_at)) desc,
        ep.video_id asc
    ) as rn
  from public.exercise_prescriptions ep
  where ep.video_id is not null
  group by ep.exercise_id, ep.video_id
),
chosen as (
  select
    exercise_id,
    video_id as chosen_video_id,
    usage_count,
    last_seen
  from ranked
  where rn = 1
)
insert into public.exercise_video_migration_audit (
  exercise_id,
  chosen_video_id,
  rule,
  chosen_video_count,
  chosen_video_last_seen
)
select
  c.exercise_id,
  c.chosen_video_id,
  'most_frequent_then_most_recent' as rule,
  c.usage_count,
  c.last_seen
from chosen c
on conflict (exercise_id) do update
set
  chosen_video_id = excluded.chosen_video_id,
  rule = excluded.rule,
  chosen_video_count = excluded.chosen_video_count,
  chosen_video_last_seen = excluded.chosen_video_last_seen;
```

### 1.3. Inserir em `exercise_videos` (apenas 1 vídeo por exercício)

```sql
insert into public.exercise_videos (exercise_id, video_id, order_index, created_at)
select
  a.exercise_id,
  a.chosen_video_id as video_id,
  0 as order_index,
  now() as created_at
from public.exercise_video_migration_audit a
on conflict (exercise_id, video_id) do nothing;
```

> **Importante:** se `exercise_videos` já tiver dados (por UI nova), este insert não apaga nada. Ele só adiciona onde não existe o par `(exercise_id, video_id)`.

### 1.4. Validação pós-migração

#### 1.4.1. Quantos exercícios ganharam vínculo?

```sql
select count(*) as exercises_with_video
from public.exercise_videos;
```

#### 1.4.2. Existe mais de 1 vídeo por exercício em `exercise_videos`? (antes de enforce)

```sql
select exercise_id, count(*) as links
from public.exercise_videos
group by exercise_id
having count(*) > 1
order by links desc;
```

Se retornar linhas, você tem duas opções:

- **Opção A (preferida):** limpar para ficar 1 por exercício (ver 1.5)
- **Opção B:** manter 1:N por enquanto e só restringir depois (não recomendado se a UI assume 1:1)

---

## Fase 1.5 — Ajustes necessários para garantir 1 exercício → 1 vídeo (recomendado)

Hoje a tabela `exercise_videos` (pelo setup) tem `UNIQUE(exercise_id, video_id)`, ou seja, permite vários vídeos para um mesmo exercício.

Para **enforce** 1:1 no banco, você precisa adicionar `UNIQUE(exercise_id)`.

### 1.5.1. (Opcional) Limpar `exercise_videos` para manter apenas 1 por exercício

Se já existem múltiplos vínculos por exercício, decida qual manter (pode reaproveitar o audit acima):

```sql
-- Mantém apenas o vídeo "chosen" do audit e remove os demais
delete from public.exercise_videos ev
using public.exercise_video_migration_audit a
where ev.exercise_id = a.exercise_id
  and ev.video_id <> a.chosen_video_id;
```

### 1.5.2. Criar constraint única por `exercise_id`

```sql
alter table public.exercise_videos
  add constraint unique_video_per_exercise unique (exercise_id);
```

Se falhar com erro de duplicidade, rode a limpeza (1.5.1) e tente novamente.

> Se você também quer garantir que sempre exista apenas **order_index = 0**, deixe esse campo ou simplifique (não é obrigatório para 1:1).

---

## Fase 2 — Remover `video_id` de `exercise_prescriptions` (quando o app estiver pronto)

> Só faça depois de atualizar o app para não ler/escrever `exercise_prescriptions.video_id`.

### 2.1. Remover FK/índices/coluna

```sql
alter table public.exercise_prescriptions
  drop constraint if exists exercise_prescriptions_video_id_fkey;

drop index if exists public.idx_exercise_prescriptions_video_id;
drop index if exists public.idx_prescriptions_video;
drop index if exists public.idx_prescriptions_exercise_video;

alter table public.exercise_prescriptions
  drop column if exists video_id;
```

---

## Pergunta: “É necessário algum ajuste?” (sobre múltiplos `video_id` por exercício)

Sim — **se a regra do produto é 1 exercício → 1 vídeo**, não dá para fazer um `insert distinct (exercise_id, video_id)` direto.

O ajuste necessário é exatamente:

1. **Detectar** exercícios com múltiplos `video_id` nas prescrições (pré-check 0.2).
2. **Escolher 1 vídeo canônico** por exercício (fase 1.2), com uma regra determinística.
3. **(Recomendado) Enforçar no banco** com `UNIQUE(exercise_id)` (fase 1.5.2).

Se você me disser qual regra você prefere (mais frequente vs mais recente vs “primeiro vídeo”), eu adapto o SQL para ficar 100% alinhado ao esperado.

