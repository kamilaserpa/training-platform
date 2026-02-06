import { Add as AddIcon } from '@mui/icons-material';
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
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { exerciseService } from '../../services/exerciseService';
import type { CreateExerciseDTO, Exercise } from '../../types/database.types';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  section?: string;
}

export const ExerciseSelector = ({ onSelect, section }: ExerciseSelectorProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criação rápida inline
  const [showQuickCreateInline, setShowQuickCreateInline] = useState(false);
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [quickExerciseName, setQuickExerciseName] = useState('');
  const createAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = exercises.filter((ex: Exercise) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredExercises(prioritizeExercisesBySection(filtered));
    } else {
      setFilteredExercises(prioritizeExercisesBySection(exercises));
    }
  }, [search, exercises, section]);

  const prioritizeExercisesBySection = (exercisesList: Exercise[]) => {
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

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')
        .overrideTypes<Exercise[], { merge: false }>();

      if (error) throw error;
      setExercises(data || []);
      setFilteredExercises(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar exercícios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateExercise = async () => {
    const name = quickExerciseName.trim();
    if (!name) return;

    try {
      setCreatingExercise(true);

      const exerciseData: CreateExerciseDTO = {
        name,
      };

      const newExercise = await exerciseService.createExercise(exerciseData);

      setExercises((prev) => [newExercise, ...prev]);
      setFilteredExercises((prev) => [newExercise, ...prev]);

      cancelQuickCreateInline();
      onSelect(newExercise);
    } catch (err: any) {
      console.error('Erro ao criar exercício:', err);
      setError(err.message);
    } finally {
      setCreatingExercise(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
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
        sx={{ mb: 2 }}
      />

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
                      <Typography variant="body1" fontWeight={500}>
                        {exercise.name}
                      </Typography>
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
