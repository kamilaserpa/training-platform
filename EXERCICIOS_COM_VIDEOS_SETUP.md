# Exercícios com Vídeos – Passos para implementação

Este documento descreve o que você precisa fazer para que a funcionalidade **Exercícios com Vídeos** funcione de ponta a ponta.

---

## 1. Criar a tabela `exercise_videos` no Supabase

A relação exercício ↔ vídeo usa a tabela de junção `exercise_videos`. Ela ainda não existe no banco até você executar o SQL.

### Opção A: Usar a migration existente

1. Abra o **Supabase Dashboard** do seu projeto.
2. Vá em **SQL Editor**.
3. Copie e execute o conteúdo do arquivo:
   ```
   supabase/migrations/20250223000000_create_exercise_videos.sql
   ```

### Opção B: Executar o SQL manualmente

Execute no **SQL Editor** do Supabase:

```sql
-- Tabela de relação N:N entre exercícios e vídeos
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

ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- Ajuste as políticas conforme as regras do seu projeto (exemplo: usuários autenticados)
CREATE POLICY "exercise_videos_select" ON public.exercise_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "exercise_videos_insert" ON public.exercise_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "exercise_videos_update" ON public.exercise_videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "exercise_videos_delete" ON public.exercise_videos FOR DELETE TO authenticated USING (true);
```

---

## 2. Ajustar políticas RLS (se necessário)

Se o seu projeto usa RLS com regras mais restritas (por exemplo, por `owner_id` ou por tenant):

- Edite as políticas `exercise_videos_*` no Supabase (**Authentication → Policies** ou via SQL) para refletir as mesmas regras que você usa em `exercises` e `videos`.
- Garanta que usuários autenticados (ou o papel que você usa) tenham permissão de **SELECT**, **INSERT**, **UPDATE** e **DELETE** em `exercise_videos` quando fizer sentido para o seu caso.

---

## 3. Verificar a aplicação

1. Inicie a aplicação (por exemplo, `npm run dev`).
2. Faça login.
3. No menu lateral, acesse **Exercícios com Vídeos**.
4. Confira:
   - Listagem de exercícios carregando.
   - **Adicionar vídeo**: abre o modal, ao clicar em um vídeo ele é vinculado ao exercício e o modal fecha.
   - Na lista do exercício, o vídeo aparece com ações **Assistir** e **Remover**.
   - **Assistir** abre o dialog e reproduz o vídeo (ou exibe a imagem).
   - **Remover** desvincula o vídeo após confirmação.

Se algo falhar (erro de permissão, tabela não existe, etc.), confira o console do navegador e as mensagens de erro do Supabase.

---

## 4. Resumo do que já está implementado (não é preciso refazer)

- Tipos TypeScript (`ExerciseVideo`, tabela no `Database`).
- Serviço `exerciseVideoService` (CRUD da relação).
- Página **Exercícios com Vídeos** (listagem, vincular, desvincular, visualizar vídeo).
- Rota `/pages/exercicios-com-videos` e item no menu lateral.
- Breadcrumb e layout responsivo/PWA.

O único passo obrigatório no backend é **criar a tabela e as políticas RLS** no Supabase (itens 1 e 2 acima).
