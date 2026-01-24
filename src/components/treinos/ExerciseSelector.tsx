import {
  Alert,
  Box,
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
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Exercise } from '../../types/database.types';

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

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredExercises(prioritizeExercisesBySection(filtered));
    } else {
      setFilteredExercises(prioritizeExercisesBySection(exercises));
    }
  }, [search, exercises, section]);

  const prioritizeExercisesBySection = (exercisesList: Exercise[]) => {
    if (!section || exercisesList.length === 0) return exercisesList;

    let relevantTags: string[] = [];
    let debugPrefix = '';

    switch (section) {
      case 'mobilidade':
        relevantTags = ['mobilidade', 'alongamento', 'articulacao'];
        debugPrefix = '🏃‍♂️ Debug Mobilidade';
        break;
      case 'core':
        relevantTags = ['core', 'estabilizacao', 'isometria'];
        debugPrefix = '💪 Debug Core';
        break;
      case 'neural':
        relevantTags = ['ativacao', 'neural', 'pliometrico', 'potencia'];
        debugPrefix = '⚡ Debug Neural';
        break;
      case 'treino1':
      case 'treino2':
        relevantTags = ['forca', 'empurrar', 'puxar', 'squat', 'hinge', 'lunge'];
        debugPrefix = '🏋️‍♀️ Debug Treino Principal';
        break;
      case 'condicionamento':
        relevantTags = ['condicionamento', 'cardio', 'hiit', 'resistencia', 'circuito'];
        debugPrefix = '🔥 Debug Condicionamento';
        break;
      default:
        return exercisesList;
    }

    // Separar exercícios por relevância
    const taggedExercises = exercisesList.filter(ex =>
      ex.tags && ex.tags.some(tag => relevantTags.includes(tag))
    );

    const otherExercises = exercisesList.filter(ex =>
      !ex.tags || !ex.tags.some(tag => relevantTags.includes(tag))
    );



    // Retornar todos: primeiro os relevantes, depois os outros
    return [...taggedExercises, ...otherExercises];
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

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
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

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
            <Typography color="text.secondary">
              Nenhum exercício encontrado
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
                          {exercise.tags.slice(0, 3).map((tag, index) => (
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
    </Box>
  );
};
