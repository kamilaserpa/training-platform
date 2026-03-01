/*
  Promote orphan `videos` rows to `exercises`.

  Context:
  - App model is 1:1 via `public.exercises.video_id -> public.videos.id`.
  - There may exist rows in `public.videos` that are not referenced by any exercise yet.

  This migration creates one exercise per orphan video, linking it via `exercises.video_id`.
  Naming rules (deterministic):
  - base_name = trimmed video.title, else "Vídeo <first8(video_id)>"
  - if there is a collision (existing exercise with same creator+name, case-insensitive)
    or multiple orphan videos share the same base_name for the same creator,
    append " (<first6(video_id)>)"
*/

with orphan_videos as (
  select v.*
  from public.videos v
  left join public.exercises e
    on e.video_id = v.id
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
  from orphan_videos v
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

