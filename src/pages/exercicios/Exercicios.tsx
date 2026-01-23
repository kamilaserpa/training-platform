import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

// Serviços e tipos
import { exerciseService } from '../../services/exerciseService';
import { movementPatternService } from '../../services/movementPatternService';
import type { CreateExerciseDTO, Exercise, MovementPattern } from '../../types/database.types';

import { useFetchExercises } from 'hooks/useFetchExercises';

// Tags predefinidas para exercícios
const PREDEFINED_TAGS = [
  // Categorias principais
  'mobilidade',
  'core',
  'ativacao',
  'forca',
  'condicionamento',

  // Subcategorias
  'articulacao',
  'alongamento',
  'estabilizacao',
  'pliometrico',
  'potencia',
  'cardio',
  'hiit',
  'resistencia',
  'circuito',
  'neural',

  // Padrões de movimento
  'empurrar',
  'puxar',
  'squat',
  'hinge',
  'lunge',
  'rotacao',

  // Grupos musculares
  'peito',
  'costas',
  'ombro',
  'bracos',
  'pernas',
  'gluteo',
  'panturrilha',
  'abdomen',

  // Intensidade
  'baixa',
  'media',
  'alta',

  // Equipamentos
  'peso_livre',
  'maquina',
  'cabo',
  'corporal',
  'elastico'
];


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
    movement_pattern_id: editingData?.movement_pattern_id || '',
    instructions: editingData?.instructions || '',
    description: editingData?.description || '',
    tags: editingData?.tags || [],
  });

  useEffect(() => {
    console.log('🔄 [ExerciseDialog] editingData mudou:', editingData);

    if (editingData) {
      setFormData({
        name: editingData.name || '',
        movement_pattern_id: editingData.movement_pattern_id || '',
        instructions: editingData.instructions || '',
        description: editingData.description || '',
        tags: editingData.tags || [],
      });
    } else {
      setFormData({
        name: '',
        movement_pattern_id: '',
        instructions: '',
        description: '',
        tags: [],
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

    console.log('💾 [ExerciseDialog] Salvando exercício:', formData);

    // Preparar dados garantindo que campos vazios sejam null (não undefined)
    const exerciseData: CreateExerciseDTO = {
      name: formData.name.trim(),
      movement_pattern_id: formData.movement_pattern_id || undefined,
      instructions: formData.instructions?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
    };

    // Limpar undefined do objeto (PostgreSQL prefere null)
    Object.keys(exerciseData).forEach(key => {
      if (exerciseData[key as keyof CreateExerciseDTO] === undefined) {
        exerciseData[key as keyof CreateExerciseDTO] = null as any;
      }
    });

    console.log('📤 [ExerciseDialog] Dados preparados para envio:', exerciseData);

    onSave(exerciseData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingData ? `Editar Exercício: ${editingData.name}` : 'Novo Exercício'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, p: 0 }}>
        <Grid container spacing={5} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nome do Exercício *"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="ex: Agachamento Livre"
              fullWidth
            />
          </Grid>
          {/* Campo Grupo Muscular removido - não relevante no momento */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Padrão de Movimento (Opcional)</InputLabel>
              <Select
                value={formData.movement_pattern_id}
                onChange={handleSelectChange('movement_pattern_id')}
                label="Padrão de Movimento (Opcional)"
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {movementPatterns.map((pattern) => (
                  <MenuItem key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              multiple
              freeSolo
              options={PREDEFINED_TAGS}
              value={formData.tags || []}
              onChange={(_, newValue) => {
                setFormData(prev => ({ ...prev, tags: newValue }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags (Opcional)"
                  placeholder="Digite ou selecione tags"
                  helperText="Ex: mobilidade, core, força, etc."
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Instruções"
              value={formData.instructions}
              onChange={handleChange('instructions')}
              placeholder="Como executar o exercício"
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Dicas importantes, cuidados especiais"
              multiline
              rows={1}
              fullWidth
            />
          </Grid>
        </Grid>
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
  // Cache-first data fetching com IndexedDB
  const {
    data: exercisesFromCache,
    isLoading: loadingExercises,
    refetch: refetchExercises,
  } = useFetchExercises();

  const [movementPatterns, setMovementPatterns] = useState<MovementPattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPadrao, setFilterPadrao] = useState('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Estados para feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Usar exercícios do cache ou array vazio
  const exercises = exercisesFromCache || [];
  const loading = loadingExercises || loadingPatterns;

  // Carregar apenas padrões de movimento (exercícios vêm do cache)
  useEffect(() => {
    let isMounted = true;

    const loadPatterns = async () => {
      try {
        setLoadingPatterns(true);
        setError(null);

        const patternsData = await movementPatternService.getAllMovementPatterns();

        if (!isMounted) return;
        setMovementPatterns(patternsData);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('❌ [Exercicios] Erro ao carregar padrões:', err);

        let errorMessage = 'Erro ao carregar padrões de movimento. ';

        if (err.code === '42501') {
          errorMessage += 'Problema de permissão. Verifique as políticas RLS no Supabase.';
        } else if (err.code === 'PGRST116') {
          errorMessage += 'Tabelas não encontradas. Execute o script de setup do banco.';
        } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
          errorMessage += 'Problema de conexão. Verifique sua internet e configurações do Supabase.';
        } else {
          errorMessage += `Detalhes: ${err.message || 'Erro desconhecido'}.`;
        }

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoadingPatterns(false);
        }
      }
    };

    loadPatterns();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadInitialData = async () => {
    await refetchExercises();
  };

  // Exercícios filtrados
  const exercisesFiltrados = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

        exercise.movement_pattern?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterPadrao === 'todos' || exercise.movement_pattern?.name === filterPadrao;

      return matchesSearch && matchesFilter;
    });
  }, [exercises, searchTerm, filterPadrao]);

  const handleSaveExercise = async (exerciseData: CreateExerciseDTO) => {
    try {
      setError(null);

      if (editingExercise) {
        const updated = await exerciseService.updateExercise(editingExercise.id, exerciseData);
        setSuccessMessage(`Exercício "${updated.name}" atualizado com sucesso!`);
      } else {
        const newExercise = await exerciseService.createExercise(exerciseData);
        setSuccessMessage(`Exercício "${newExercise.name}" criado com sucesso!`);
      }

      // Atualizar cache com dados frescos
      await refetchExercises();

      setOpenDialog(false);
      setEditingExercise(null);
      setShowSuccess(true);
    } catch (err: any) {

      let errorMessage = 'Erro ao salvar exercício. ';
      if (err.code === '42501') {
        errorMessage += 'Sem permissão para esta operação.';
      } else if (err.code === 'PGRST116') {
        errorMessage += 'Tabela não encontrada.';
      } else {
        errorMessage += err.message || 'Tente novamente.';
      }

      setError(errorMessage);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const exerciseToDelete = exercises.find(ex => ex.id === id);
    const exerciseName = exerciseToDelete?.name || 'exercício';

    if (!confirm(`Tem certeza que deseja excluir o exercício "${exerciseName}"?`)) return;

    try {
      console.log('🗑️ [Exercicios] Excluindo exercício:', id);
      setError(null);
      await exerciseService.deleteExercise(id);

      // Atualizar cache com dados frescos
      await refetchExercises();

      setSuccessMessage(`Exercício "${exerciseName}" excluído com sucesso!`);
      setShowSuccess(true);
      console.log('✅ [Exercicios] Exercício excluído com sucesso');
    } catch (err: any) {
      console.error('❌ [Exercicios] Erro ao deletar exercício:', err);

      let errorMessage = 'Erro ao excluir exercício. ';
      if (err.code === '42501') {
        errorMessage += 'Sem permissão para esta operação.';
      } else if (err.code === 'PGRST116') {
        errorMessage += 'Exercício não encontrado.';
      } else {
        errorMessage += err.message || 'Tente novamente.';
      }

      setError(errorMessage);
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
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 0, sm: 3 } }}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadInitialData}
              disabled={loading}
            >
              Tentar Novamente
            </Button>
          }
        >
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
            minWidth: { xs: 40, sm: 'auto' },
            px: { xs: 1, sm: 2 },
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '0 8px 0 -4px' },
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Novo Exercício
          </Box>
        </Button>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ py: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label="Buscar exercícios"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou padrão de movimento..."
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
                    <Typography variant="subtitle2">Padrão de Movimento</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Tags</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Descrição</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2">Ações</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exercisesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                          {exercise.movement_pattern?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {exercise.tags && exercise.tags.length > 0 ? (
                            exercise.tags.slice(0, 3).map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                          {exercise.tags && exercise.tags.length > 3 && (
                            <Chip
                              label={`+${exercise.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.description || exercise.instructions || '-'}
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

      {/* Snackbar para mensagens de sucesso */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ExerciciosPage;
