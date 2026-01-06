import { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

// Serviços e tipos
import { exerciseService } from '../../services/exerciseService';
import { movementPatternService } from '../../services/movementPatternService';
import type { Exercise, MovementPattern, CreateExerciseDTO } from '../../types/database.types';

// Interface para props do dialog
interface ExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateExerciseDTO) => void;
  editingData: Exercise | null;
  movementPatterns: MovementPattern[];
}

// Dialog de formulário para adicionar/editar exercício
function ExerciseDialog({
  open,
  onClose,
  onSave,
  editingData,
  movementPatterns,
}: ExerciseDialogProps) {
  const [formData, setFormData] = useState({
    name: editingData?.name || '',
    muscle_group: editingData?.muscle_group || '',
    movement_pattern_id: editingData?.movement_pattern_id || '',
    instructions: editingData?.instructions || '',
    notes: editingData?.notes || '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        muscle_group: editingData.muscle_group || '',
        movement_pattern_id: editingData.movement_pattern_id || '',
        instructions: editingData.instructions || '',
        notes: editingData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        muscle_group: '',
        movement_pattern_id: '',
        instructions: '',
        notes: '',
      });
    }
  }, [editingData]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome do exercício');
      return;
    }

    const exerciseData: CreateExerciseDTO = {
      name: formData.name.trim(),
      muscle_group: formData.muscle_group.trim() || undefined,
      movement_pattern_id: formData.movement_pattern_id || undefined,
      instructions: formData.instructions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    onSave(exerciseData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Nome do Exercício *"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="ex: Agachamento Livre"
            fullWidth
          />

          <TextField
            label="Grupo Muscular"
            value={formData.muscle_group}
            onChange={handleChange('muscle_group')}
            placeholder="ex: Pernas, Peito, Costas"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Padrão de Movimento</InputLabel>
            <Select
              value={formData.movement_pattern_id}
              onChange={handleSelectChange('movement_pattern_id')}
              label="Padrão de Movimento"
            >
              <MenuItem value="">Nenhum</MenuItem>
              {movementPatterns.map((pattern) => (
                <MenuItem key={pattern.id} value={pattern.id}>
                  {pattern.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Instruções"
            value={formData.instructions}
            onChange={handleChange('instructions')}
            placeholder="Como executar o exercício"
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Observações"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Dicas importantes, cuidados especiais"
            multiline
            rows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          {editingData ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExerciciosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [movementPatterns, setMovementPatterns] = useState<MovementPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPadrao, setFilterPadrao] = useState('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [exercisesData, patternsData] = await Promise.all([
        exerciseService.getAllExercises(),
        movementPatternService.getAllMovementPatterns(),
      ]);

      setExercises(exercisesData);
      setMovementPatterns(patternsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Exercícios filtrados
  const exercisesFiltrados = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.movement_pattern?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterPadrao === 'todos' || exercise.movement_pattern?.name === filterPadrao;

      return matchesSearch && matchesFilter;
    });
  }, [exercises, searchTerm, filterPadrao]);

  const handleSaveExercise = async (exerciseData: CreateExerciseDTO) => {
    try {
      if (editingExercise) {
        const updated = await exerciseService.updateExercise(editingExercise.id, exerciseData);
        setExercises((prev) => prev.map((ex) => (ex.id === updated.id ? updated : ex)));
      } else {
        const newExercise = await exerciseService.createExercise(exerciseData);
        setExercises((prev) => [newExercise, ...prev]);
      }

      setOpenDialog(false);
      setEditingExercise(null);
    } catch (err) {
      console.error('Erro ao salvar exercício:', err);
      setError('Erro ao salvar exercício. Tente novamente.');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      await exerciseService.deleteExercise(id);
      setExercises((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err) {
      console.error('Erro ao deletar exercício:', err);
      setError('Erro ao deletar exercício. Tente novamente.');
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setOpenDialog(true);
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Grid container spacing={2.5} justifyContent="center" alignItems="center" minHeight="400px">
        <Grid item>
          <CircularProgress size={60} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Exercícios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddExercise}
          sx={{
            minWidth: { xs: 'auto', md: 150 },
            px: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Novo Exercício</Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Novo</Box>
        </Button>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon />
            <Typography variant="h6" fontWeight="600">
              Filtros
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label="Buscar exercícios"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, grupo muscular ou padrão..."
              size="small"
              sx={{ flex: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Padrão</InputLabel>
              <Select
                value={filterPadrao}
                onChange={(e) => setFilterPadrao(e.target.value)}
                label="Filtrar por Padrão"
              >
                <MenuItem value="todos">Todos</MenuItem>
                {movementPatterns.map((pattern) => (
                  <MenuItem key={pattern.id} value={pattern.name}>
                    {pattern.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de Exercícios */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600">
              Exercícios Encontrados ({exercisesFiltrados.length})
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2">Nome</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Grupo Muscular</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Padrão de Movimento</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Observações</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2">Ações</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exercisesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || filterPadrao !== 'todos'
                          ? 'Nenhum exercício encontrado com os filtros aplicados'
                          : 'Nenhum exercício cadastrado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  exercisesFiltrados.map((exercise) => (
                    <TableRow key={exercise.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {exercise.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.muscle_group || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.movement_pattern?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.notes || exercise.instructions || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={1}>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditExercise(exercise)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteExercise(exercise.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {exercisesFiltrados.length} de {exercises.length} exercícios
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar */}
      <ExerciseDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveExercise}
        editingData={editingExercise}
        movementPatterns={movementPatterns}
      />
    </Container>
  );
}

export default ExerciciosPage;
