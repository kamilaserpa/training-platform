# TreinoForm — Indicar mídia associada ao escolher exercício (sem perder performance)

## Contexto (estado atual)

No fluxo de adicionar exercício em `src/pages/treinos/TreinoForm.jsx`, a seleção de exercícios é feita pelo modal `src/components/treinos/AddExerciseModal.tsx`, que usa `src/components/treinos/ExerciseSelector.tsx`.

- A lista do `ExerciseSelector` carrega dados **lite** via `exerciseService.getExercisesLiteForSelector()` (cacheado).
- A informação de mídia pode vir **sem custo extra** na listagem usando `exercise.video_id` (1:1 via `public.exercises.video_id`).
- Após o clique no exercício, o modal pode buscar o exercício completo (incluindo `video`) para exibir preview, se necessário.

Isso cria um “gap” de usabilidade: antes de clicar, o usuário não sabe se o exercício tem mídia e qual é.

## Objetivo

Melhorar a UX do usuário ao escolher um exercício (ex.: mostrar um badge/ícone de “tem mídia”, e opcionalmente “qual mídia”) **sem degradar**:

- tempo de abertura do modal,
- consumo de rede,
- performance de render em listas grandes.

## Requisitos/Restrições

- Evitar N+1 requests (1 request por item da lista) ao renderizar.
- Não gerar Signed URLs em massa (caro e lento) para todos os itens.
- Respeitar RLS/policies do Supabase (principalmente em `exercises`, `videos`, `users`).

---

## Opção A — Trazer metadata leve na lista (1 request) [recomendado]

### Ideia
Modificar a fonte de dados do selector para retornar, além de `id/name/tags/movement_pattern`, dados mínimos de mídia:

- `video_id: uuid | null` (já indica se existe mídia, sem join adicional)
- opcional: `first_media_title`
- opcional: `first_media_storage_path` (apenas se necessário para preview lazy)

### Como implementar (alto nível)
- (Alternativa mais simples no modelo atual) incluir `video_id` diretamente no tipo lite do selector.
- O front troca `getExercisesLiteForSelector()` para consultar essa view/RPC.

### UX sugerida
- Na linha do exercício: mostrar um **ícone** 🎬 quando `has_media=true`.
- Tooltip: “Mídia: <título>”.
- Miniatura só com lazy loading (ver Opção C).

### Prós
- 1 query cacheável.
- Escala bem com listas grandes.
- Não depende de “carregar vínculos” depois.

### Contras
- Requer mudança no banco (view/RPC).

---

## Opção B — Batch request só para itens visíveis (2 requests totais, sem mudar banco)

### Ideia
Manter `getExercisesLiteForSelector()` como está e adicionar uma chamada extra que pega mídia em lote:

- Após calcular a lista filtrada, pega só os primeiros N (ex.: 30–50 ids).
- Faz **uma** query para buscar detalhes do vídeo apenas dos itens visíveis, usando `exercises.video_id`.

### UX sugerida
- Exibir 🎬 quando houver entrada no map.
- Tooltip com `video.title` (primeiro vídeo).

### Prós
- Não mexe no schema do banco.
- Evita N+1: é 1 request por “página” (ou por mudança de busca).

### Contras
- Precisa lógica extra para paginação/limites.
- Ainda adiciona carga de rede em buscas rápidas (mitigar com debounce).

---

## Opção C — Miniatura progressiva (lazy) + cache (para evitar custo de Signed URLs)

### Ideia
Miniatura é a parte mais cara porque exige Signed URL (bucket privado). Estratégia:

1. Mostrar apenas ícone/label inicialmente (usando A ou B para saber se tem mídia).
2. Gerar Signed URL e renderizar miniatura **só**:
   - em hover/focus (desktop), ou
   - quando o item entrar no viewport (IntersectionObserver), ou
   - ao expandir um item.
3. Cache `Map<storage_path, signedUrl>` com TTL curto (ex.: 1–5 min) para não regenerar constantemente.

### Prós
- UI rica sem explodir custo de rede.
- Controla o “pior caso” (listas longas).

### Contras
- Implementação mais trabalhosa.
- Em mobile, hover não existe → preferir “viewport” ou “expandir”.

---

## Recomendação

- **Fase 1 (rápida e escalável):** Opção **A** (view/RPC) retornando `has_media` + `first_media_title`.
  - Mostrar 🎬 + tooltip na lista.
- **Fase 2 (se quiser miniatura):** Opção **C** por cima, com lazy loading e cache de Signed URLs.

Se não quiser mexer no banco agora:
- Implementar **Opção B** (batch) + (opcional) **C** (lazy).

---

## Pontos do código relacionados

- `src/components/treinos/ExerciseSelector.tsx`: listagem de exercícios (dados lite, cache).
- `src/components/treinos/AddExerciseModal.tsx`: ao selecionar exercício, busca o exercício completo para pegar `exercise.video`.
- `src/services/exerciseService.ts`: `getExercisesLiteForSelector()` / `getExerciseById()`.

