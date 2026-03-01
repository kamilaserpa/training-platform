# Exercícios com Vídeos – Setup (modelo atual)

Este documento descreve o que você precisa fazer para que a funcionalidade **Exercícios com Vídeos** funcione de ponta a ponta **no modelo atual**:

- Relacionamento **1:1** via `public.exercises.video_id` → `public.videos.id`
- A tabela `exercise_videos` **não é necessária** para o app

---

## 1. Garantir coluna `exercises.video_id` no Supabase

Garanta que a tabela `public.exercises` tenha a coluna `video_id` com FK para `public.videos`.

### SQL (rodar uma vez)

```sql
alter table public.exercises
  add column if not exists video_id uuid null;

alter table public.exercises
  add constraint if not exists exercises_video_id_fkey
  foreign key (video_id) references public.videos (id)
  on delete set null;

create index if not exists idx_exercises_video_id on public.exercises (video_id);

-- Opcional (se você quer garantir 1 vídeo → no máximo 1 exercício)
-- create unique index if not exists uq_exercises_video_id
-- on public.exercises (video_id)
-- where video_id is not null;
```

---

## 2. Ajustar políticas RLS (se necessário)

Se o seu projeto usa RLS com regras mais restritas (por exemplo, por `owner_id` ou por tenant):

- Garanta que usuários autenticados (ou o papel que você usa) tenham permissão de **SELECT/INSERT/UPDATE** em `exercises` e `videos` conforme o fluxo do app.
- Para remoção de mídia, o app precisa de permissão de `UPDATE exercises.video_id`.

---

## 3. Verificar a aplicação

1. Inicie a aplicação (por exemplo, `npm run dev`).
2. Faça login.
3. No menu lateral, acesse **Exercícios com Vídeos**.
4. Confira:
   - Listagem de exercícios carregando.
   - Ao criar/editar exercício, é possível associar mídia e ela aparece como miniatura/preview.
   - **Assistir** abre o dialog e reproduz o vídeo (ou exibe a imagem).
   - **Remover** desvincula a mídia (seta `exercises.video_id = null`).

Se algo falhar (erro de permissão, tabela não existe, etc.), confira o console do navegador e as mensagens de erro do Supabase.

---

## 4. Resumo do que já está implementado (não é preciso refazer)

- Página **Exercícios com Vídeos** (listagem, editar, visualizar mídia).
- Rota `/pages/exercicios-com-videos` e item no menu lateral.
- Breadcrumb e layout responsivo/PWA.

O único passo obrigatório no backend é **garantir a coluna `exercises.video_id`** e as políticas RLS necessárias (itens 1 e 2 acima).
