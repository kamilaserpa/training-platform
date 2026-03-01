/*
  Promote ALL `public.videos` rows to `public.exercises`.

  Goal:
  - Ensure every video has a corresponding exercise such that:
      exercises.video_id = videos.id
      exercises.name derived from videos.title

  Strategy (idempotent):
  1) If there exists an exercise with same creator+name (case-insensitive) and video_id is NULL,
     link it by setting exercise.video_id = video.id.
  2) For remaining videos not referenced by any exercise.video_id, create one exercise per video.

  Naming rules (deterministic):
  - base_name = trimmed video.title, else "Vídeo <first8(video_id)>"
  - if there is a collision (existing exercise with same creator+name, case-insensitive)
    or multiple videos share the same base_name for the same creator in this run,
    append " (<first6(video_id)>)"
*/

-- 1) Link by title (creator + case-insensitive name) when exercise.video_id is still NULL.
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
    row_number() over (partition by m.video_id order by m.exercise_id asc) as rn
  from matched m
)
update public.exercises e
set video_id = r.video_id
from ranked r
where r.rn = 1
  and e.id = r.exercise_id;

-- 2) Create exercises for videos that are still not referenced by any exercise.video_id.
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

