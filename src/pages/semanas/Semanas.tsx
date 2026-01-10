import { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Serviços e tipos
import { weekService } from '../../services/weekService';
import { useAuth } from '../../contexts/AuthContext';
import type { TrainingWeek, WeekFocus, CreateTrainingWeekDTO } from '../../types/database.types';
import { DatabaseSetupAlert } from '../../components/DatabaseSetupAlert';

// Interface para props do dialog
interface WeekDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateTrainingWeekDTO) => void;
  editingData: TrainingWeek | null;
  weekFocuses: WeekFocus[];
}

// Utilitários para formatação
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'primary';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Ativa';
    case 'completed':
      return 'Concluída';
    case 'draft':
      return 'Rascunho';
    case 'archived':
      return 'Arquivada';
    default:
      return status;
  }
};

// Dialog de formulário para adicionar/editar semana
function WeekDialog({ open, onClose, onSave, editingData, weekFocuses }: WeekDialogProps) {
  const [formData, setFormData] = useState({
    name: editingData?.name || '',
    week_focus_id: editingData?.week_focus_id || '',
    start_date: editingData?.start_date || '',
    end_date: editingData?.end_date || '',
    notes: editingData?.notes || '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        week_focus_id: editingData.week_focus_id || '',
        start_date: editingData.start_date || '',
        end_date: editingData.end_date || '',
        notes: editingData.notes || '',
      });
    } else {
      // Para nova semana, definir datas padrão (semana atual)
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      setFormData({
        name: '',
        week_focus_id: '',
        start_date: monday.toISOString().split('T')[0],
        end_date: sunday.toISOString().split('T')[0],
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
      alert('Por favor, informe o nome da semana');
      return;
    }

    if (!formData.week_focus_id) {
      alert('Por favor, selecione um foco para a semana');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      alert('Por favor, informe as datas de início e fim');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      alert('A data de fim deve ser posterior à data de início');
      return;
    }

    const weekData: CreateTrainingWeekDTO = {
      name: formData.name.trim(),
      week_focus_id: formData.week_focus_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      notes: formData.notes.trim() || undefined,
      // created_by será preenchido automaticamente pelo trigger
    };

    onSave(weekData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      disableRestoreFocus
      disableEnforceFocus
    >
      <DialogTitle>{editingData ? 'Editar Semana' : 'Nova Semana'}</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Grid container spacing={5} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome da Semana *"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="ex: Semana 1 - Janeiro 2026"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Foco da Semana</InputLabel>
              <Select
                value={formData.week_focus_id}
                onChange={handleSelectChange('week_focus_id')}
                label="Foco da Semana"
              >
                {weekFocuses.map((focus, index) => (
                  <MenuItem key={`focus-${focus.id}-${index}`} value={focus.id}>
                    {focus.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Data de Início *"
              type="date"
              value={formData.start_date}
              onChange={handleChange('start_date')}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Data de Fim *"
              type="date"
              value={formData.end_date}
              onChange={handleChange('end_date')}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observações"
              value={formData.notes}
              onChange={handleChange('notes')}
              placeholder="Objetivos, observações especiais..."
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          {editingData ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SemanasPage() {
  const auth = useAuth();
  const [trainingWeeks, setTrainingWeeks] = useState<TrainingWeek[]>([]);
  const [weekFocuses, setWeekFocuses] = useState<WeekFocus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWeek, setEditingWeek] = useState<TrainingWeek | null>(null);
  
  // Estado para dialog de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    weekId: '',
    weekName: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [weeksData, focusesData] = await Promise.all([
        weekService.getAllTrainingWeeks(),
        weekService.getAllWeekFocuses(),
      ]);

      // Filtrar duplicatas por ID para evitar chaves duplicadas no React
      const uniqueWeeks = weeksData.filter((week, index, self) => 
        index === self.findIndex(w => w.id === week.id)
      );
      const uniqueFocuses = focusesData.filter((focus, index, self) => 
        index === self.findIndex(f => f.id === focus.id)
      );

      console.log(`📊 [Semanas] Carregadas ${uniqueWeeks.length} semanas únicas (total original: ${weeksData.length})`);
      console.log(`📊 [Semanas] Carregados ${uniqueFocuses.length} focos únicos (total original: ${focusesData.length})`);

      setTrainingWeeks(uniqueWeeks);
      setWeekFocuses(uniqueFocuses);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      
      // Verificar se é erro de autenticação
      if (err?.message?.includes('Invalid Refresh Token') || err?.message?.includes('refresh_token_not_found') || err?.code === '42501') {
        console.log('🔄 [Auth] Token inválido detectado na inicialização, limpando sessão...');
        await auth.clearSession();
        setError('Sessão expirada. Execute o script de limpeza ou faça login novamente.');
      } else {
        setError('Erro ao carregar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Semanas filtradas
  const weeksFiltradas = trainingWeeks.filter((week) => {
    const matchesSearch =
      week.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      week.week_focus?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || week.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSaveWeek = async (weekData: CreateTrainingWeekDTO) => {
    try {
      if (editingWeek) {
        const updated = await weekService.updateTrainingWeek(editingWeek.id, weekData);
        setTrainingWeeks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      } else {
        const newWeek = await weekService.createTrainingWeek(weekData);
        setTrainingWeeks((prev) => [newWeek, ...prev]);
      }

      setOpenDialog(false);
      setEditingWeek(null);
    } catch (err: any) {
      console.error('Erro ao salvar semana:', err);
      
      // Verificar se é erro de autenticação ou RLS
      if (err?.message?.includes('Invalid Refresh Token') || err?.message?.includes('refresh_token_not_found')) {
        console.log('🔄 [Auth] Token inválido detectado, limpando sessão...');
        await auth.clearSession();
        setError('Sessão expirada. Execute o script de limpeza ou faça login novamente.');
      } else if (err?.code === '42501') {
        setError('Erro de permissão: Execute o script fix-training-weeks-rls.sql no Supabase SQL Editor.');
      } else {
        setError('Erro ao salvar semana. Tente novamente.');
      }
    }
  };

  const handleDeleteWeek = (id: string) => {
    const week = trainingWeeks.find(w => w.id === id);
    setDeleteDialog({
      open: true,
      weekId: id,
      weekName: week?.name || 'esta semana'
    });
  };

  const confirmDeleteWeek = async () => {
    const { weekId } = deleteDialog;
    setDeleteDialog({ open: false, weekId: '', weekName: '' });

    try {
      await weekService.deleteTrainingWeek(weekId);
      setTrainingWeeks((prev) => prev.filter((w) => w.id !== weekId));
    } catch (err) {
      console.error('Erro ao deletar semana:', err);
      setError('Erro ao deletar semana. Tente novamente.');
    }
  };

  const handleEditWeek = (week: TrainingWeek) => {
    setEditingWeek(week);
    setOpenDialog(true);
  };

  const handleAddWeek = () => {
    setEditingWeek(null);
    setOpenDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('todos');
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
    <Grid container spacing={2.5}>
      {error && (
        <Grid item xs={12}>
          <DatabaseSetupAlert 
            error={error} 
            onRetry={() => {
              setError(null);
              loadInitialData();
            }} 
          />
        </Grid>
      )}

      {/* Header */}
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            Semanas de Treino
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddWeek}
            sx={{ 
              minWidth: { xs: 'auto', sm: 150 },
              px: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AddIcon />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Nova Semana
            </Box>
          </Button>
        </Stack>
      </Grid>

      {/* Controles */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'row', md: 'row' }} sx={{ mt: 3 }} spacing={2} alignItems="center" justifyContent="space-between">
              <TextField
                label="Buscar semanas"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome da semana ou foco..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flexGrow: 1, minWidth: { xs: '200px', md: 300 }, maxWidth: { xs: 'calc(100% - 60px)', md: 'none' } }}
              />

              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ 
                  minWidth: { xs: '48px', md: 120 },
                  width: { xs: '48px', md: 'auto' },
                  px: { xs: 1, md: 2 },
                  '& .MuiButton-startIcon': {
                    display: { xs: 'none', md: 'inline-flex' },
                    marginRight: { xs: 0, md: '6px' }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <ClearIcon />
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  Limpar
                </Box>
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Tabela de semanas */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Nome</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">Foco</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">Período</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">Status</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">Treinos</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">Ações</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weeksFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm || filterStatus !== 'todos'
                      ? 'Nenhuma semana encontrada com os filtros aplicados'
                      : 'Nenhuma semana cadastrada'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              weeksFiltradas.map((week, index) => (
                <TableRow key={`week-${week.id}-${index}`} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {week.name}
                    </Typography>
                    {week.notes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {week.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={week.week_focus?.name || 'Sem foco'}
                      size="small"
                      sx={{
                        bgcolor: week.week_focus?.color_hex || '#grey',
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(week.start_date)} - {formatDate(week.end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(week.status)}
                      color={getStatusColor(week.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {week.trainings?.length || 0} treino(s)
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={1}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditWeek(week)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWeek(week.id)}
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
      </Grid>

      {/* Summary */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {weeksFiltradas.length} de {trainingWeeks.length} semanas
          </Typography>
        </Box>
      </Grid>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, weekId: '', weekName: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{deleteDialog.weekName}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Todos os treinos desta semana serão removidos permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, weekId: '', weekName: '' })}>
            Cancelar
          </Button>
          <Button onClick={confirmDeleteWeek} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar/editar */}
      <WeekDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveWeek}
        editingData={editingWeek}
        weekFocuses={weekFocuses}
      />
    </Grid>
  );
}

export default SemanasPage;
