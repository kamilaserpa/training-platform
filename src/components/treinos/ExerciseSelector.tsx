import {
    Alert,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Exercise } from '../../types/database.types';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseSelector = ({ onSelect }: ExerciseSelectorProps) => {
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
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(exercises);
    }
  }, [search, exercises]);

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
    <Box>
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
              <ListItemButton onClick={() => onSelect(exercise)}>
                <ListItemText
                  primary={exercise.name}
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
