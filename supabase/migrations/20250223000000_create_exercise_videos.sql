-- Tabela de relação N:N entre exercícios e vídeos (vídeos vinculados ao exercício).
-- Execute no SQL Editor do Supabase se a tabela ainda não existir.

CREATE TABLE IF NOT EXISTS public.exercise_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(exercise_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_videos_exercise_id ON public.exercise_videos(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_video_id ON public.exercise_videos(video_id);

COMMENT ON TABLE public.exercise_videos IS 'Vínculos entre exercícios e vídeos da biblioteca';

-- RLS (ajuste conforme as políticas do seu projeto)
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- Exemplo: permitir leitura e escrita para usuários autenticados (ajuste conforme suas políticas)
CREATE POLICY "exercise_videos_select" ON public.exercise_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "exercise_videos_insert" ON public.exercise_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "exercise_videos_update" ON public.exercise_videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "exercise_videos_delete" ON public.exercise_videos FOR DELETE TO authenticated USING (true);
