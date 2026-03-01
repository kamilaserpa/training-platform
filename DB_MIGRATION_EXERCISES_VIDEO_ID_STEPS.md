# Migração alternativa — mover para `exercises.video_id` (em vez de `exercise_videos`)

## Objetivo

- Tornar o relacionamento **1 exercício → 1 vídeo** explícito e simples, usando `public.exercises.video_id`.
- Migrar dados existentes de:
  1) (Opcional) `public.exercise_videos` → `public.exercises.video_id` (se a tabela existir e tiver dados)
  2) `public.exercise_prescriptions.video_id` → `public.exercises.video_id` (para completar lacunas)
  3) `public.videos` órfãos → criar linhas em `public.exercises` (quando existirem vídeos que “não viraram exercício”)
- Atualizar UI/serviços para ler/escrever **somente** `exercises.video_id` com impacto mínimo.

---

## Fase 0 — Preparar schema

### 0.1. Adicionar coluna e FK em `exercises`

```sql
alter table public.exercises
  add column if not exists video_id uuid null;

alter table public.exercises
  add constraint exercises_video_id_fkey
  foreign key (video_id) references public.videos (id)
  on delete set null;

create index if not exists idx_exercises_video_id on public.exercises (video_id);
```

> Opcional (se você quer garantir **1 vídeo → no máximo 1 exercício**):
>
> ```sql
> create unique index if not exists uq_exercises_video_id
> on public.exercises (video_id)
> where video_id is not null;
> ```

---

## Fase 1 — Migrar `exercise_videos` → `exercises.video_id`

> **Opcional.** Se o seu banco **não tem** `public.exercise_videos` (ou se já está vazio), pule esta fase.

### 1.1. Checar se há múltiplos vídeos por exercício (na tabela nova)

```sql
select exercise_id, count(*) as links
from public.exercise_videos
group by exercise_id
having count(*) > 1
order by links desc;
```

### 1.2. Escolher 1 vídeo canônico por exercício (regra determinística)

Regra sugerida para `exercise_videos`:

- menor `order_index`
- depois menor `created_at`
- depois menor `video_id`

```sql
with ranked as (
  select
    ev.exercise_id,
    ev.video_id,
    ev.order_index,
    ev.created_at,
    row_number() over (
      partition by ev.exercise_id
      order by ev.order_index asc, ev.created_at asc, ev.video_id asc
    ) as rn
  from public.exercise_videos ev
),
chosen as (
  select exercise_id, video_id
  from ranked
  where rn = 1
)
update public.exercises e
set video_id = c.video_id
from chosen c
where c.exercise_id = e.id
  and e.video_id is null;
```

### 1.3. Validação pós-migração

```sql
-- quantos exercícios têm video_id
select count(*) from public.exercises where video_id is not null;

-- exercícios que têm vínculo em exercise_videos mas video_id ainda está null (não deveria)
select ev.exercise_id
from public.exercise_videos ev
join public.exercises e on e.id = ev.exercise_id
where e.video_id is null
group by ev.exercise_id;
```

---

## Fase 2 (posterior) — Migrar `exercise_prescriptions.video_id` → `exercises.video_id`

Objetivo aqui é **preencher lacunas** para exercícios que ainda ficaram sem `video_id`.

### 2.1. Checar se há prescrições com vídeo

```sql
select count(*) from public.exercise_prescriptions where video_id is not null;
```

### 2.2. Preencher `exercises.video_id` (somente onde ainda estiver null)

Como você confirmou que **não existe** caso com múltiplos `video_id` por `exercise_id` em `exercise_prescriptions`,
podemos usar uma atualização direta pegando um `video_id` por exercício.

Regra: pega o vídeo mais recente visto em prescrições (por `updated_at/created_at`).

```sql
with ranked as (
  select
    ep.exercise_id,
    ep.video_id,
    max(coalesce(ep.updated_at, ep.created_at)) as last_seen,
    row_number() over (
      partition by ep.exercise_id
      order by
        max(coalesce(ep.updated_at, ep.created_at)) desc,
        ep.video_id asc
    ) as rn
  from public.exercise_prescriptions ep
  where ep.video_id is not null
  group by ep.exercise_id, ep.video_id
),
chosen as (
  select exercise_id, video_id
  from ranked
  where rn = 1
)
update public.exercises e
set video_id = c.video_id
from chosen c
where c.exercise_id = e.id
  and e.video_id is null;
```

---

## Fase 2.5 — Promover vídeos (`videos` → `exercises`)

Objetivo: garantir que **todo vídeo** em `public.videos` tenha um exercício correspondente em `public.exercises`,
onde:

- `exercises.video_id = videos.id`
- `exercises.name` vem de `videos.title` (trim)
- se já existir um exercício com o mesmo nome (por criador), ele deve ser **reutilizado** (link) quando possível
- se não existir, ele deve ser **criado**

> No repositório, existe uma migration pronta:
> `supabase/migrations/20260301000010_promote_all_videos_to_exercises.sql`.

### 2.5.1. (Opcional) Diagnóstico antes de rodar

#### 2.5.1.1. Quantos vídeos ainda não estão vinculados por `video_id`?

```sql
select count(*) as videos_without_exercise_video_id
from public.videos v
left join public.exercises e on e.video_id = v.id
where e.id is null;
```

#### 2.5.1.2. Quantos desses vídeos podem ser “linkados” por título (sem criar exercício novo)?

```sql
with v as (
  select
    id as video_id,
    created_by,
    coalesce(nullif(btrim(title), ''), 'Vídeo ' || left(id::text, 8)) as base_name
  from public.videos
)
select count(*) as linkable_by_title
from v
join public.exercises e
  on e.created_by is not distinct from v.created_by
 and lower(e.name) = lower(v.base_name)
where e.video_id is null;
```

### 2.5.2. Linkar por título e criar exercícios faltantes (determinístico e seguro)

Regras:

- Primeiro tenta **reutilizar** exercício existente com mesmo nome (por `created_by` + `lower(name)`), setando `video_id` quando `video_id` ainda estiver `null`.
- Para os vídeos restantes, **cria** um exercício por vídeo.
- `name` do exercício vem de `videos.title` (trim). Se `title` vier vazio: `Vídeo <prefixo-do-id>`.
- Em caso de colisão de nome (mesmo criador + nome, case-insensitive) ou duplicidade, adiciona sufixo `(<prefixo-do-video_id>)` (determinístico).

```sql
-- 1) Linkar por título (quando existe exercício com mesmo nome e video_id ainda é null)
with v as (
  select
    id as video_id,
    created_by,
    coalesce(nullif(btrim(title), ''), 'Vídeo ' || left(id::text, 8)) as base_name
  from public.videos
),
matched as (
  select
    v.video_id,
    e.id as exercise_id
  from v
  join public.exercises e
    on e.created_by is not distinct from v.created_by
   and lower(e.name) = lower(v.base_name)
  where e.video_id is null
),
ranked as (
  select
    m.*,
    row_number() over (
      partition by m.video_id
      order by m.exercise_id asc
    ) as rn
  from matched m
)
update public.exercises e
set video_id = r.video_id
from ranked r
where r.rn = 1
  and e.id = r.exercise_id;

-- 2) Criar exercícios para vídeos ainda não vinculados via exercises.video_id
with unlinked_videos as (
  select v.*
  from public.videos v
  left join public.exercises e on e.video_id = v.id
  where e.id is null
),
prepared as (
  select
    v.id as video_id,
    coalesce(nullif(btrim(v.title), ''), 'Vídeo ' || left(v.id::text, 8)) as base_name,
    v.created_by,
    v.description,
    v.tags,
    v.created_at,
    v.updated_at
  from unlinked_videos v
),
dedup as (
  select
    p.*,
    row_number() over (
      partition by p.created_by, lower(p.base_name)
      order by coalesce(p.created_at, now()) asc, p.video_id asc
    ) as dup_rn
  from prepared p
),
named as (
  select
    d.*,
    exists (
      select 1
      from public.exercises e
      where e.created_by is not distinct from d.created_by
        and lower(e.name) = lower(d.base_name)
    ) as name_exists_already
  from dedup d
)
insert into public.exercises (
  name,
  description,
  tags,
  video_id,
  created_by,
  created_at,
  updated_at
)
select
  case
    when n.dup_rn > 1 or n.name_exists_already
      then n.base_name || ' (' || left(n.video_id::text, 6) || ')'
    else n.base_name
  end as name,
  nullif(btrim(coalesce(n.description, '')), '') as description,
  n.tags,
  n.video_id,
  n.created_by,
  coalesce(n.created_at, now()) as created_at,
  coalesce(n.updated_at, n.created_at, now()) as updated_at
from named n;
```

---

### 2.5.3. Validação pós-migração (recomendado)

#### 2.5.3.1. Quantos vídeos continuam sem exercício?

O esperado é **0** (a menos que existam restrições/RLS impedindo insert em `exercises`).

```sql
select count(*) as videos_without_exercise_after
from public.videos v
left join public.exercises e on e.video_id = v.id
where e.id is null;
```

#### 2.5.3.2. Quantos exercícios agora possuem `video_id`?

```sql
select count(*) as exercises_with_video
from public.exercises
where video_id is not null;
```

#### 2.5.3.3. Conferir possíveis colisões de nome por criador (case-insensitive)

Isto deve retornar **0 linhas** se os nomes estiverem únicos por criador.

```sql
select
  created_by,
  lower(name) as name_ci,
  count(*) as qty
from public.exercises
group by created_by, lower(name)
having count(*) > 1
order by qty desc;
```

#### 2.5.3.4. Listar exercícios criados a partir de vídeos órfãos (amostra)

```sql
select
  e.id as exercise_id,
  e.name as exercise_name,
  v.id as video_id,
  v.title as video_title,
  e.created_by
from public.exercises e
join public.videos v on v.id = e.video_id
order by e.created_at desc
limit 50;
```

---

## Fase 3 — Atualizar app (mínimo impacto)

### 3.1. Estratégia recomendada (transição segura)

- **Leitura**: mudar todas as leituras “vídeos do exercício” para usar `exercises.video_id` (join `videos`).
- **Escrita**: ao salvar exercício:
  - upload cria registro em `videos`
  - setar `exercises.video_id = videos.id`
  - remover mídia = `exercises.video_id = null`
- Opcional (durante transição): manter `exercise_videos` só como legado (não escrever mais).

### 3.2. Pontos de código que normalmente precisam mudar

- `src/services/exerciseService.ts`
  - leitura/escrita do vídeo do exercício deve ser sempre via `exercises.video_id` (com embed `video:videos!exercises_video_id_fkey(*)`).
- `src/pages/exercicios/ExerciciosComVideos.tsx`
  - deve ler `exercise.video` (embed) e salvar removendo/definindo `exercise.video_id`.
- `src/components/exercicios/ExerciseWithVideoDialog.tsx`
  - ao salvar, atualizar `exercises.video_id` (e no modo “Personalizar”, copiar `video_id` do exercício base quando não houver upload).
- `src/components/treinos/AddExerciseModal.tsx`
  - ao selecionar exercício, buscar o exercício completo e usar `exercise.video` para preview (com timeout para evitar “loading infinito”).

---

## Fase 4 (quando estiver estável) — Remover legado

1. Remover `video_id` de `exercise_prescriptions` (após o app parar de usar).
2. Remover a tabela `exercise_videos` (ou manter apenas para auditoria, se quiser).
