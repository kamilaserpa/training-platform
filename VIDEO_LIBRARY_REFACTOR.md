# 📚 Refatoração: Sistema de Biblioteca de Vídeos

## ✅ Implementado

### 1. Database Schema
- ✅ **Arquivo:** `supabase-instructions/migrations/add-video-library.sql`
- ✅ Criados ENUMs: `video_level`, `video_plane`, `video_type`, `video_genre`, `video_source`
- ✅ Tabela `videos` com todas as colunas especificadas
- ✅ Índices para performance
- ✅ Coluna `video_id` em `exercise_prescriptions`
- ✅ Script de migração de dados existentes
- ✅ Remoção de `video_path` e `video_size_kb` de `exercises`
- ✅ Políticas RLS completas para `videos`
- ✅ Trigger `updated_at`

### 2. TypeScript Types
- ✅ **Arquivo:** `src/types/database.types.ts`
- ✅ Tipos para enums de vídeo
- ✅ Interface `Video` completa
- ✅ Interface `Exercise` atualizada (sem video_path)
- ✅ Interface `ExercisePrescription` com `video_id`
- ✅ DTOs: `CreateVideoDTO`, `UpdateVideoDTO`, `VideoFilters`
- ✅ Removido `video_path` e `video_size_kb` de `CreateExerciseDTO`

### 3. Backend Service
- ✅ **Arquivo:** `src/services/videoService.ts`
- ✅ `getVideos(filters)` - Buscar com filtros avançados
- ✅ `getVideoById(id)` - Buscar vídeo específico
- ✅ `getVideosByExerciseId(exerciseId)` - Vídeos de um exercício
- ✅ `createVideo(dto)` - Criar novo vídeo
- ✅ `updateVideo(id, dto)` - Atualizar vídeo
- ✅ `deleteVideo(id)` - Deletar vídeo
- ✅ `getVideoStats()` - Estatísticas de uso
- ✅ `getAllTags()` - Tags únicas para autocomplete

### 4. Storage Service Atualizado
- ✅ **Arquivo:** `src/services/privateVideoStorage.ts`
- ✅ Upload usa `videoId` (UUID) ao invés de `exerciseId`
- ✅ Path atualizado: `videos/{uuid}.mp4` ao invés de `exercises/{id}.mp4`

---

## 🚧 Falta Implementar

### 1. Execute o SQL Migration
```bash
# No Supabase SQL Editor, execute:
supabase-instructions/migrations/add-video-library.sql
```

### 2. Frontend - Biblioteca de Vídeos

#### Componente: VideoLibrary
```tsx
// src/pages/biblioteca/VideoLibrary.tsx
- Lista todos os vídeos disponíveis
- Filtros por level, plane, type, genre, source
- Busca por texto (título/descrição)
- Card com thumbnail, título, tags
- Ações: editar, deletar, preview
```

#### Componente: VideoUploadDialog
```tsx
// src/components/biblioteca/VideoUploadDialog.tsx
- Formulário completo de upload
- Campos: título, descrição, exercise_id, level, plane, type, genre, tags
- Upload do arquivo de vídeo
- Preview do vídeo
- Salva em videos table via videoService
```

#### Componente: VideoSelector
```tsx
// src/components/biblioteca/VideoSelector.tsx
- Usado no TreinoForm ao adicionar exercício
- Mostra vídeos disponíveis para o exercise_id
- Filtro rápido por level/plane
- Permite selecionar qual vídeo usar neste treino
- Salva video_id no exercise_prescription
```

### 3. Atualizar TreinoForm
```tsx
// src/pages/treinos/TreinoForm.jsx
- Ao adicionar exercício, mostrar VideoSelector
- Permitir escolher vídeo específico
- Salvar video_id no prescription
- Campo opcional: pode não ter vídeo
```

### 4. Atualizar TreinoPublico
```tsx
// src/pages/treinos/TreinoPublico.jsx
- Buscar video via prescription.video_id
- Se não tiver, buscar primeiro vídeo do exercício (fallback)
- Exibir no Collapse como está agora
```

### 5. Atualizar ExerciseDialog
```tsx
// src/pages/exercicios/Exercicios.tsx
- Remover VideoUpload antigo
- Adicionar link para biblioteca de vídeos
- "Ver vídeos deste exercício" (abre modal)
- "Adicionar novo vídeo" (abre VideoUploadDialog)
```

### 6. Rotas
```tsx
// src/routes/paths.ts
export default {
  // ... existing
  videoLibrary: '/biblioteca-videos',
}

// src/routes/router.tsx
{
  path: paths.videoLibrary,
  element: <VideoLibrary />,
}
```

### 7. Menu de Navegação
```tsx
// Adicionar no Sidebar
- Ícone: VideoLibraryIcon
- Label: "Biblioteca de Vídeos"
- Path: /biblioteca-videos
```

---

## 🎯 Fluxo de Uso

### Personal Trainer:
1. **Biblioteca de Vídeos** (`/biblioteca-videos`)
   - Vê vídeos da plataforma (baseline)
   - Vê seus vídeos personalizados
   - Upload novo vídeo → escolhe exercício, classifica (level, plane, etc)

2. **Criando Treino** (`/treinos/novo`)
   - Adiciona exercício
   - Sistema mostra vídeos disponíveis para aquele exercício
   - Personal escolhe qual vídeo o aluno verá
   - Pode escolher vídeo mais fácil (beginner) ou avançado (advanced)
   - Pode escolher ângulo (frontal, lateral, etc)

### Aluno (Página Pública):
1. **Visualiza Treino** (`/treino-publico/:token`)
   - Vê o vídeo específico escolhido pelo personal
   - Botão "Ver demonstração" → abre Collapse com vídeo
   - Vídeo carrega via signed URL (24h)

---

## 📊 Benefícios do Novo Modelo

1. **Biblioteca Centralizada**
   - Personal gerencia todos os vídeos em um lugar
   - Reutiliza vídeos em múltiplos treinos
   - Plataforma oferece baseline de vídeos

2. **Contexto do Treino**
   - Mesmo exercício, vídeos diferentes conforme treino
   - Exemplo: "Agachamento" para iniciante vs avançado
   - Aluno vê exatamente o que o personal escolheu

3. **Escalabilidade**
   - Fácil adicionar vídeos de múltiplos ângulos
   - Tags permitem busca avançada
   - Source separa plataforma vs personal

4. **Manutenção**
   - Atualizar vídeo afeta todos os treinos que usam
   - Histórico de qual vídeo foi usado em cada treino
   - Estatísticas de uso

---

## 🔄 Migration Path

### Dados Existentes:
1. Script SQL migra automaticamente:
   ```sql
   exercises.video_path → videos.storage_path
   ```
2. Cria registro em `videos` para cada exercício com vídeo
3. Atualiza `exercise_prescriptions.video_id` automaticamente
4. Remove colunas antigas de `exercises`

### Rollback (se necessário):
```sql
-- Backup foi criado antes da remoção
SELECT * FROM exercises_video_backup;
```

---

## 🚀 Próximos Passos

1. **Execute o SQL** no Supabase (arquivo `add-video-library.sql`)
2. **Crie VideoLibrary page** (lista + filtros)
3. **Crie VideoUploadDialog** (form de upload)
4. **Crie VideoSelector** (escolher vídeo no treino)
5. **Atualize TreinoForm** (integrar VideoSelector)
6. **Atualize TreinoPublico** (usar video_id)
7. **Teste migração** com dados existentes

---

## 📝 Checklist de Implementação

- [x] SQL schema completo
- [x] TypeScript types
- [x] Backend service (videoService)
- [x] Storage service atualizado
- [ ] SQL executado no Supabase
- [ ] Página VideoLibrary
- [ ] Componente VideoUploadDialog
- [ ] Componente VideoSelector
- [ ] TreinoForm atualizado
- [ ] TreinoPublico atualizado
- [ ] ExerciseDialog atualizado
- [ ] Rotas configuradas
- [ ] Menu de navegação atualizado
- [ ] Testes com dados reais

---

## 💡 Dicas de Implementação

### VideoLibrary (Prioridade 1)
- Use DataGrid do MUI para lista
- Filtros em Drawer lateral
- Search bar no topo
- Cards com thumbnail (se tiver) ou ícone padrão

### VideoSelector (Prioridade 2)
- Componente pequeno, inline no form
- Autocomplete do MUI funciona bem
- Mostrar preview ao selecionar

### Upload (Prioridade 3)
- Reutilizar lógica de privateVideoStorage
- Gerar UUID antes: `const videoId = crypto.randomUUID()`
- Upload primeiro, depois criar registro na tabela

---

Quer que eu implemente algum desses componentes de frontend agora?
