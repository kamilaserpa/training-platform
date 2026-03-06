import { Add as AddIcon, OndemandVideo as VideoIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { db } from '../../lib/db';
import type { ExerciseLiteForSelector } from '../../services/exerciseService';
import { exerciseService } from '../../services/exerciseService';
import type { CreateExerciseDTO } from '../../types/database.types';
import { NoTranslate } from '../common/NoTranslate';

interface ExerciseSelectorProps {
  onSelect: (exercise: ExerciseSelectorItem) => void;
  section?: string;
}

export type ExerciseSelectorItem = ExerciseLiteForSelector;

const EXERCISES_SELECTOR_CACHE_KEY = 'exercises:selector-lite';
const EXERCISES_SELECTOR_TTL_MS = 10 * 60 * 1000; // 10 min

export const ExerciseSelector = ({ onSelect, section }: ExerciseSelectorProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [localError, setLocalError] = useState<string | null>(null);

  // Criação rápida inline
  const [showQuickCreateInline, setShowQuickCreateInline] = useState(false);
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [quickExerciseName, setQuickExerciseName] = useState('');
  const createAreaRef = useRef<HTMLDivElement | null>(null);

  const [optimisticAdded, setOptimisticAdded] = useState<ExerciseSelectorItem[]>([]);

  const cacheKey = useMemo(() => {
    // A lista depende do usuário (meus + app owners), então cacheia por usuário.
    return user?.id ? `${EXERCISES_SELECTOR_CACHE_KEY}:${user.id}` : EXERCISES_SELECTOR_CACHE_KEY;
  }, [user?.id]);

  const {
    data: cachedExercises,
    isLoading,
    isRevalidating,
    error: loadError,
    refetch,
  } = useCachedQuery<ExerciseSelectorItem[]>({
    cacheKey,
    fetcher: async () => {
      if (!user?.id) return await exerciseService.getExercisesLiteForSelector();
      // Unifica: exercícios do usuário + exercícios do app (owners)
      return await exerciseService.getExercisesLiteForSelectorUserAndApp(user.id);
    },
    ttl: EXERCISES_SELECTOR_TTL_MS,
    revalidateOnMount: false,
    revalidateOnFocus: false,
  });

  const prioritizeExercisesBySection = (exercisesList: ExerciseSelectorItem[]) => {
    let relevantTags: string[] = [];

    switch (section) {
      case 'mobilidade':
        relevantTags = ['mobilidade', 'alongamento', 'articulacao'];
        break;
      case 'core':
        relevantTags = ['core', 'estabilizacao', 'isometria'];
        break;
      case 'neural':
        relevantTags = ['ativacao', 'neural', 'pliometrico', 'potencia'];
        break;
      case 'treino1':
      case 'treino2':
        relevantTags = ['forca', 'empurrar', 'puxar', 'squat', 'hinge', 'lunge'];
        break;
      case 'condicionamento':
        relevantTags = ['condicionamento', 'cardio', 'hiit', 'resistencia', 'circuito'];
        break;
      default:
        return exercisesList;
    }

    const taggedExercises = exercisesList.filter(
      (ex) => ex.tags && ex.tags.some((tag: string) => relevantTags.includes(tag))
    );

    const otherExercises = exercisesList.filter(
      (ex) => !ex.tags || !ex.tags.some((tag: string) => relevantTags.includes(tag))
    );

    return [...taggedExercises, ...otherExercises];
  };

  const exercises = useMemo(() => {
    const base = cachedExercises ?? [];
    if (optimisticAdded.length === 0) return base;

    const byId = new Map<string, ExerciseSelectorItem>();
    for (const ex of [...optimisticAdded, ...base]) {
      byId.set(ex.id, ex);
    }
    return Array.from(byId.values());
  }, [cachedExercises, optimisticAdded]);

  const filteredExercises = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const filtered = q
      ? exercises.filter((ex) => ex.name.toLowerCase().includes(q))
      : exercises;

    return prioritizeExercisesBySection(filtered);
  }, [deferredSearch, exercises, section]);

  const openQuickCreateInline = () => {
    setQuickExerciseName(search.trim() || '');
    setShowQuickCreateInline(true);
    // Garantir que os botões fiquem visíveis ao abrir a criação
    setTimeout(() => {
      createAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  const cancelQuickCreateInline = () => {
    setQuickExerciseName('');
    setShowQuickCreateInline(false);
  };

  const upsertExerciseInSelectorCache = async (exercise: ExerciseSelectorItem) => {
    try {
      const current = await db.getCache<ExerciseSelectorItem[]>(cacheKey);
      const list = current?.data ?? [];

      const byId = new Map<string, ExerciseSelectorItem>();
      for (const ex of [exercise, ...list]) byId.set(ex.id, ex);

      await db.setCache(cacheKey, Array.from(byId.values()), EXERCISES_SELECTOR_TTL_MS);
    } catch (e) {
      // Cache é best-effort; falha aqui não deve bloquear o fluxo do usuário
      console.warn('Falha ao atualizar cache de exercícios do selector:', e);
    }
  };

  const handleCreateExercise = async () => {
    const name = quickExerciseName.trim();
    if (!name) return;

    try {
      setCreatingExercise(true);
      setLocalError(null);

      const exerciseData: CreateExerciseDTO = {
        name,
      };

      const newExercise = await exerciseService.createExercise(exerciseData);
      const selectorItem: ExerciseSelectorItem = {
        id: newExercise.id,
        name: newExercise.name,
        tags: newExercise.tags ?? undefined,
        movement_pattern: newExercise.movement_pattern?.name
          ? { name: newExercise.movement_pattern.name }
          : null,
      };

      setOptimisticAdded((prev) => [selectorItem, ...prev]);
      await upsertExerciseInSelectorCache(selectorItem);

      cancelQuickCreateInline();
      onSelect(selectorItem);
    } catch (err: any) {
      console.error('Erro ao criar exercício:', err);
      setLocalError(err.message);
    } finally {
      setCreatingExercise(false);
    }
  };

  if (isLoading && !cachedExercises) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || localError) {
    return (
      <Alert
        severity="error"
        sx={{ m: 2 }}
        action={
          loadError ? (
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          ) : undefined
        }
      >
        {localError || loadError?.message}
      </Alert>
    );
  }

  return (
    <Box pt={2}>
      <TextField
        fullWidth
        size="small"
        label="Buscar"
        placeholder="Buscar exercício..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        inputProps={{ translate: 'no', className: 'notranslate' }}
        sx={{ mb: 2 }}
      />

      {isRevalidating && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Atualizando lista de exercícios...
        </Typography>
      )}

      {/* Área de criação movida para o rodapé abaixo da lista */}

      <List
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        {filteredExercises.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary" gutterBottom>
              {search.trim()
                ? `Nenhum exercício encontrado para "${search}"`
                : 'Nenhum exercício encontrado'}
            </Typography>
          </Box>
        ) : (
          filteredExercises.map((exercise) => (
            <ListItem key={exercise.id} disablePadding>
              <ListItemButton onClick={() => onSelect(exercise)} sx={{ py: 2 }}>
                <ListItemText
                  primary={
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" fontWeight={500} color="text.primary">
                          <NoTranslate>{exercise.name}</NoTranslate>
                        </Typography>
                        {exercise.video_id && (
                          <VideoIcon
                            fontSize="small"
                            color="action"
                            titleAccess="Tem mídia"
                          />
                        )}
                      </Stack>
                      {exercise.tags && exercise.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                          {exercise.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {exercise.tags.length > 3 && (
                            <Chip
                              label={`+${exercise.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Stack>
                      )}
                    </Box>
                  }
                  secondary={exercise.movement_pattern?.name}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Bloco de criação abaixo da lista (sempre visível no rodapé) */}
      <Box mt={2} ref={createAreaRef}>
        {!showQuickCreateInline ? (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={openQuickCreateInline}
            fullWidth
            sx={{
              borderStyle: 'dashed',
              '&:hover': {
                borderStyle: 'dashed',
                backgroundColor: 'primary.50',
              },
            }}
          >
            {search.trim() ? `Criar \"${search.trim()}\"` : 'Criar novo exercício'}
          </Button>
        ) : (
          <Box display="flex" flexDirection="column" gap={2} pt={4}>
            <TextField
              label="Nome do Exercício *"
              value={quickExerciseName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickExerciseName(e.target.value)}
              inputProps={{ translate: 'no', className: 'notranslate' }}
              fullWidth
              autoFocus
              required
            />
            <Box
              display="flex"
              gap={1}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                '& > button': {
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 120 },
                },
              }}
            >
              <Button onClick={cancelQuickCreateInline} disabled={creatingExercise}
                variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateExercise}
                variant="contained"
                disabled={!quickExerciseName.trim() || creatingExercise}
                startIcon={creatingExercise ? <CircularProgress size={16} /> : <AddIcon />}
              >
                {creatingExercise ? 'Criando...' : 'Criar e Usar'}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Você pode completar outros detalhes posteriormente na tela de Exercícios.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
