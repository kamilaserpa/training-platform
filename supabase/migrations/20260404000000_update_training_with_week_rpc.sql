-- Função RPC para atualizar treino recalculando a semana automaticamente
-- Permite alteração livre da data, recriando/associando a semana conforme necessário

CREATE OR REPLACE FUNCTION public.update_training_with_week(
  p_training_id uuid,
  p_name text,
  p_scheduled_date date,
  p_week_focus_id uuid,
  p_created_by uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_start_date date;
  v_end_date date;
  v_training_week_id uuid;
BEGIN
  -- Validação: usuário só pode atualizar seus próprios treinos
  IF p_created_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'invalid created_by';
  END IF;

  -- Validar que o treino existe e pertence ao usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.trainings
    WHERE id = p_training_id AND created_by = p_created_by
  ) THEN
    RAISE EXCEPTION 'training not found or unauthorized';
  END IF;

  -- Calcular semana (segunda-feira) baseado na nova data
  v_start_date := date_trunc('week', p_scheduled_date)::date;
  v_end_date := (v_start_date + interval '6 days')::date;

  -- Criar ou obter semana
  -- Se a semana já existir para este usuário, mantém o foco existente
  -- Se não existir, cria com o foco fornecido
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
  DO UPDATE SET
    -- Mantém o foco existente (não atualiza)
    week_focus_id = public.training_weeks.week_focus_id
  RETURNING id INTO v_training_week_id;

  -- Atualizar treino com nova data e semana recalculada
  UPDATE public.trainings
  SET
    name = p_name,
    scheduled_date = p_scheduled_date,
    training_week_id = v_training_week_id,
    updated_at = now()
  WHERE id = p_training_id;

END;
$$;

GRANT EXECUTE ON FUNCTION public.update_training_with_week(uuid, text, date, uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.update_training_with_week IS
'Atualiza um treino recalculando automaticamente a semana baseado na nova data. Se a semana não existir, cria com o foco fornecido. Se já existir, mantém o foco original.';
