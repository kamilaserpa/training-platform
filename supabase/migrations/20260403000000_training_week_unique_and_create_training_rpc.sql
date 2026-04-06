-- Unicidade (created_by, start_date) para upsert de semana alinhado à segunda-feira (date_trunc week).
-- Se já existir duplicata no banco, a migração falhará até deduplicação manual.

ALTER TABLE public.training_weeks
  ADD CONSTRAINT unique_user_week UNIQUE (created_by, start_date);

CREATE OR REPLACE FUNCTION public.create_training_with_week(
  p_name text,
  p_scheduled_date date,
  p_week_focus_id uuid,
  p_created_by uuid,
  p_movement_pattern_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_internal_notes text DEFAULT NULL,
  p_estimated_duration_minutes integer DEFAULT NULL,
  p_share_status text DEFAULT NULL,
  p_share_token text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_start_date date;
  v_end_date date;
  v_training_week_id uuid;
  v_training_id uuid;
BEGIN
  IF p_created_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'invalid created_by';
  END IF;

  -- Semana ISO: segunda-feira (consistente com date_trunc('week', ...) no Postgres)
  v_start_date := date_trunc('week', p_scheduled_date)::date;
  v_end_date := (v_start_date + interval '6 days')::date;

  INSERT INTO public.training_weeks (
    name,
    start_date,
    end_date,
    week_focus_id,
    created_by
  )
  VALUES (
    to_char(p_scheduled_date, 'IYYY-IW'),
    v_start_date,
    v_end_date,
    p_week_focus_id,
    p_created_by
  )
  ON CONFLICT (created_by, start_date)
  DO NOTHING
  RETURNING id INTO v_training_week_id;

  -- Se houve conflito (DO NOTHING), SELECT a semana existente
  IF v_training_week_id IS NULL THEN
    SELECT id INTO v_training_week_id
    FROM public.training_weeks
    WHERE created_by = p_created_by
      AND start_date = v_start_date
    LIMIT 1;
  END IF;

  INSERT INTO public.trainings (
    training_week_id,
    name,
    scheduled_date,
    created_by,
    movement_pattern_id,
    description,
    internal_notes,
    estimated_duration_minutes,
    share_status,
    share_token
  )
  VALUES (
    v_training_week_id,
    p_name,
    p_scheduled_date,
    p_created_by,
    p_movement_pattern_id,
    p_description,
    p_internal_notes,
    p_estimated_duration_minutes,
    CASE WHEN p_share_status IS NOT NULL THEN p_share_status::public.share_status ELSE NULL END,
    COALESCE(NULLIF(p_share_token, '')::uuid, gen_random_uuid())
  )
  RETURNING id INTO v_training_id;

  RETURN v_training_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_training_with_week(text, date, uuid, uuid, uuid, text, text, integer, text, text) TO authenticated;
