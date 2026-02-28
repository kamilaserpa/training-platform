# Migração alternativa — mover para `exercises.video_id` (em vez de `exercise_videos`)

## Objetivo

- Tornar o relacionamento **1 exercício → 1 vídeo** explícito e simples, usando `public.exercises.video_id`.
- Migrar dados existentes de:
  1) `public.exercise_videos` → `public.exercises.video_id` (primeiro passo)
  2) `public.exercise_prescriptions.video_id` → `public.exercises.video_id` (passo posterior, para completar lacunas)
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

## Fase 3 — Atualizar app (mínimo impacto)

### 3.1. Estratégia recomendada (transição segura)

- **Leitura**: mudar todas as leituras “vídeos do exercício” para usar `exercises.video_id` (join `videos`).
- **Escrita**: ao salvar exercício:
  - upload cria registro em `videos`
  - setar `exercises.video_id = videos.id`
  - remover mídia = `exercises.video_id = null`
- Opcional (durante transição): manter `exercise_videos` só como legado (não escrever mais).

### 3.2. Pontos de código que normalmente precisam mudar

- `src/services/exerciseVideoService.ts`
  - pode ser aposentado (ou virar um wrapper temporário que lê `exercises.video_id`).
- `src/components/treinos/AddExerciseModal.tsx`
  - hoje chama `exerciseVideoService.getVideosByExerciseId(exercise.id)`
  - trocar para “buscar vídeo do exercício” via `exercise.video_id` (embed `videos` no select ou `videoService.getVideoById`).
- `src/pages/exercicios/ExerciciosComVideos.tsx`
  - hoje carrega `exercise_videos` agrupado
  - trocar para trazer `video:videos(*)` direto no select de exercícios.
- `src/components/exercicios/ExerciseWithVideoDialog.tsx`
  - hoje cria `exercise_videos.link(exerciseId, videoId)`
  - trocar para `exerciseService.updateExercise(exerciseId, { video_id: videoId })` (ou método dedicado)
  - no modo “Personalizar”, copiar `video_id` do exercício base para o novo exercício quando não houver upload.

---

## Fase 4 (quando estiver estável) — Remover legado

1. Remover `video_id` de `exercise_prescriptions` (após o app parar de usar).
2. Remover a tabela `exercise_videos` (ou manter apenas para auditoria, se quiser).
