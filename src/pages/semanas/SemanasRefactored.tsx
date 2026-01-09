import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Componentes, dados e serviços
import { trainingService } from '../../services/trainingService';
import { weekService } from '../../services/weekService';
import { adaptarSemanasParaVisualizacao, type SemanaComTreinos } from '../../utils/semanaAdapter';
import { SemanaRow } from '../../components/semanas/SemanaRow';
import { SemanaCard } from '../../components/semanas/SemanaCard';
import type { WeekFocus, CreateTrainingWeekDTO } from '../../types/database.types';

const SemanasRefactored = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [semanas, setSemanas] = useState<SemanaComTreinos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Estados para o dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [weekFocuses, setWeekFocuses] = useState<WeekFocus[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    week_focus_id: '',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Buscar dados do banco
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [SemanasRefactored] Carregando dados...');
        const [weeksWithTrainings, focusesData] = await Promise.all([
          trainingService.getWeeksWithTrainings(),
          weekService.getAllWeekFocuses(),
        ]);
        
        if (!isMounted) return;

        const semanasAdaptadas = adaptarSemanasParaVisualizacao(weeksWithTrainings);
        setSemanas(semanasAdaptadas);
        setWeekFocuses(focusesData);
        
        console.log('✅ [SemanasRefactored] Carregadas', semanasAdaptadas.length, 'semanas');
        console.log('✅ [SemanasRefactored] Carregados', focusesData.length, 'focos');
      } catch (err) {
        if (!isMounted) return;
        
        console.error('❌ [SemanasRefactored] Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtros
  const filteredSemanas = semanas.filter((semana) => {
    const matchesSearch = 
      semana.focoSemana.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semana.numeroSemana.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || semana.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleOpenDialog = () => {
    // Definir datas padrão (semana atual)
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      week_focus_id: '',
      start_date: '',
      end_date: '',
      notes: '',
    });
  };

  const handleFormChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSaveWeek = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe o nome da semana',
        severity: 'error'
      });
      return;
    }

    if (!formData.week_focus_id) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione um foco para a semana',
        severity: 'error'
      });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe as datas de início e fim',
        severity: 'error'
      });
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setSnackbar({
        open: true,
        message: 'A data de fim deve ser posterior à data de início',
        severity: 'error'
      });
      return;
    }

    try {
      const weekData: CreateTrainingWeekDTO = {
        name: formData.name.trim(),
        week_focus_id: formData.week_focus_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes.trim() || undefined,
      };

      await weekService.createTrainingWeek(weekData);
      
      setSnackbar({
        open: true,
        message: 'Semana criada com sucesso!',
        severity: 'success'
      });
      
      handleCloseDialog();
      
      // Recarregar dados
      setLoading(true);
      const weeksWithTrainings = await trainingService.getWeeksWithTrainings();
      const semanasAdaptadas = adaptarSemanasParaVisualizacao(weeksWithTrainings);
      setSemanas(semanasAdaptadas);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ Erro ao criar semana:', err);
      setSnackbar({
        open: true,
        message: err?.message || 'Erro ao criar semana. Tente novamente.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Semanas de Treino
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie os treinos de cada semana
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenDialog}
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
      </Box>

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            placeholder="Buscar por semana ou foco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativa</MenuItem>
                <MenuItem value="draft">Rascunho</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
              </Select>
            </FormControl>
        </Stack>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando semanas...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Conteúdo - Desktop (Tabela) */}
      {!loading && !error && (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Semana
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Foco
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Período
                  </Typography>
                </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSemanas.map((semana) => (
                    <SemanaRow key={semana.id} semana={semana} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Conteúdo - Mobile (Cards) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <Stack 
              spacing={2}
              sx={{ 
                width: '100%',
                flexDirection: 'column'
              }}
            >
              {filteredSemanas.map((semana) => (
                <SemanaCard key={semana.id} semana={semana} />
              ))}
            </Stack>
          </Box>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSemanas.length === 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma semana encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {semanas.length === 0 
              ? 'Não há semanas cadastradas ainda.' 
              : 'Tente ajustar os filtros de busca.'
            }
          </Typography>
        </Paper>
      )}

      {/* Dialog para criar semana */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Nova Semana</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome da Semana *"
                value={formData.name}
                onChange={handleFormChange('name')}
                placeholder="ex: Semana 1 - Janeiro 2026"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Foco da Semana</InputLabel>
                <Select
                  value={formData.week_focus_id}
                  onChange={handleFormChange('week_focus_id')}
                  label="Foco da Semana"
                >
                  {weekFocuses.map((focus) => (
                    <MenuItem key={focus.id} value={focus.id}>
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
                onChange={handleFormChange('start_date')}
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
                onChange={handleFormChange('end_date')}
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
                onChange={handleFormChange('notes')}
                placeholder="Objetivos, observações especiais..."
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveWeek} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SemanasRefactored;
