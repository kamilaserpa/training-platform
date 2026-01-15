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
  Snackbar,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Componentes, dados e serviços
import { weekService } from '../../services/weekService';
import { adaptarSemanasParaVisualizacao, type SemanaComTreinos } from '../../utils/semanaAdapter';
import { useFetchWeeks } from 'hooks/useFetchWeeks';
import { SemanaRow } from '../../components/semanas/SemanaRow';
import { SemanaCard } from '../../components/semanas/SemanaCard';
import type { WeekFocus, CreateTrainingWeekDTO } from '../../types/database.types';
import { generateSemanaPDF } from '../../utils/pdf/generateSemanaPDF';
import { imageToBase64 } from '../../utils/pdf/pdfUtils';
import logoImage from '../../assets/images/logo-main.png';
import { useWeeksSelection } from '../../contexts/WeeksSelectionContext';
import QuickExportModal from 'components/export/QuickExportModal';
import { trainingService } from '../../services/trainingService';

const SemanasRefactored = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Cache-first data fetching com IndexedDB
  const {
    data: weeksFromCache,
    isLoading: loadingWeeks,
    refetch: refetchWeeks,
  } = useFetchWeeks();

  const [weekFocuses, setWeekFocuses] = useState<WeekFocus[]>([]);
  const [loadingFocuses, setLoadingFocuses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Adaptar semanas do cache (garantir que trainings existe)
  const semanas = weeksFromCache 
    ? adaptarSemanasParaVisualizacao(weeksFromCache.map(w => ({
        ...w,
        trainings: w.trainings || []
      })))
    : [];
  const loading = loadingWeeks || loadingFocuses;

  // Estados para o dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSemanaId, setEditingSemanaId] = useState<string | null>(null);
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

  const { selectedWeekIds, setSelectedWeeks, clearSelection } = useWeeksSelection();
  const [quickExportOpen, setQuickExportOpen] = useState(false);
  const [quickExportWeeks, setQuickExportWeeks] = useState<SemanaComTreinos[]>([]);

  // Estado para dialog de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    semanaId: '',
    semanaNome: ''
  });

  // Carregar apenas focos (semanas vêm do cache)
  useEffect(() => {
    let isMounted = true;

    const loadFocuses = async () => {
      try {
        setLoadingFocuses(true);
        setError(null);

        console.log('🔄 [SemanasRefactored] Carregando focos...');
        const focusesData = await weekService.getAllWeekFocuses();

        if (!isMounted) return;
        setWeekFocuses(focusesData);
        console.log('✅ [SemanasRefactored] Carregados', focusesData.length, 'focos');
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ [SemanasRefactored] Erro ao carregar focos:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        if (isMounted) {
          setLoadingFocuses(false);
        }
      }
    };

    loadFocuses();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtro unificado e inteligente
  const filteredSemanas = semanas.filter((semana) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase().replace(/\s/g, '');

    // Buscar em: nome, foco, número da semana e período (data, mês, ano)
    const startDate = new Date(semana.start_date);
    const endDate = new Date(semana.end_date);

    const matchesName = semana.name?.toLowerCase().includes(term);
    const matchesFoco = semana.focoSemana.toLowerCase().includes(term);
    const matchesNumero = semana.numeroSemana.toString().includes(term);

    // Buscar por datas em diferentes formatos
    const startStr = startDate.toLocaleDateString('pt-BR');
    const endStr = endDate.toLocaleDateString('pt-BR');
    const monthYear = `${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`;
    const monthName = startDate.toLocaleDateString('pt-BR', { month: 'long' }).toLowerCase();
    const monthShort = startDate.toLocaleDateString('pt-BR', { month: 'short' }).toLowerCase();

    const matchesPeriod =
      startStr.includes(term) ||
      endStr.includes(term) ||
      monthYear.includes(term) ||
      monthName.includes(term) ||
      monthShort.includes(term);

    return matchesName || matchesFoco || matchesNumero || matchesPeriod;
  });

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

  const isWeekInCurrentDateRange = (s: SemanaComTreinos) => {
    const today = new Date();
    const start = new Date(s.start_date);
    const end = new Date(s.end_date);
    return start <= today && today <= end;
  };

  const handleGlobalExportClick = async () => {
    // Determine target weeks: selected or current week
    let targetIds = selectedWeekIds;
    if (targetIds.length === 0) {
      const current = filteredSemanas.find(isWeekInCurrentDateRange) || filteredSemanas[0];
      if (current) {
        setQuickExportWeeks([current]);
      } else {
        setQuickExportWeeks([]);
      }
    } else {
      const selectedMap = new Map(filteredSemanas.map((s) => [s.id, s]));
      setQuickExportWeeks(targetIds.map((id) => selectedMap.get(id)).filter(Boolean) as SemanaComTreinos[]);
    }
    setQuickExportOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSemanaId(null);
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

  const handleEditWeek = async (semanaId: string) => {
    console.log('📝 Editar semana:', semanaId);

    try {
      // Buscar dados completos da semana
      const semanaData = await weekService.getTrainingWeekById(semanaId);

      if (!semanaData) {
        setSnackbar({
          open: true,
          message: 'Semana não encontrada',
          severity: 'error'
        });
        return;
      }

      setFormData({
        name: semanaData.name || '',
        week_focus_id: semanaData.week_focus_id || '',
        start_date: semanaData.start_date || '',
        end_date: semanaData.end_date || '',
        notes: semanaData.notes || '',
      });

      setEditingSemanaId(semanaId);
      setOpenDialog(true);

    } catch (err: any) {
      console.error('❌ Erro ao carregar semana:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados da semana',
        severity: 'error'
      });
    }
  };

  const handleDeleteWeek = (semanaId: string) => {
    const semana = semanas.find(s => s.id === semanaId);
    setDeleteDialog({
      open: true,
      semanaId,
      semanaNome: semana?.name || 'esta semana'
    });
  };

  const confirmDeleteWeek = async () => {
    const { semanaId } = deleteDialog;
    setDeleteDialog({ open: false, semanaId: '', semanaNome: '' });

    try {
      await weekService.deleteTrainingWeek(semanaId);

      setSnackbar({
        open: true,
        message: 'Semana excluída com sucesso!',
        severity: 'success'
      });

      // Atualizar cache com dados frescos
      await refetchWeeks();

    } catch (err: any) {
      console.error('❌ Erro ao excluir semana:', err);
      setSnackbar({
        open: true,
        message: err?.message || 'Erro ao excluir semana. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleExportWeek = async (semanaId: string) => {
    try {
      const semana = semanas.find(s => s.id === semanaId);
      if (!semana) return;
      const treinos = await trainingService.getTrainingsByWeek(semanaId);
      const logoBase64 = await imageToBase64(logoImage);
      const semanaPdf = {
        name: semana.name,
        week_focus: { name: semana.focoSemana },
        start_date: semana.start_date,
        end_date: semana.end_date,
        description: (semana as any).notes || undefined,
      } as any;
      await generateSemanaPDF(semanaPdf, treinos, logoBase64);
    } catch (err: any) {
      console.error('❌ Erro ao exportar semana:', err);
      setSnackbar({ open: true, message: err?.message || 'Erro ao exportar semana', severity: 'error' });
    }
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

      if (editingSemanaId) {
        // Atualizar semana existente
        await weekService.updateTrainingWeek(editingSemanaId, weekData);

        setSnackbar({
          open: true,
          message: 'Semana atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova semana
        await weekService.createTrainingWeek(weekData);

        setSnackbar({
          open: true,
          message: 'Semana criada com sucesso!',
          severity: 'success'
        });
      }

      handleCloseDialog();

      // Atualizar cache com dados frescos
      await refetchWeeks();

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
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 0, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-start' }} spacing={{ xs: 2, md: 0 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Semanas de Treino
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie os treinos de cada semana
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            sx={{
              mt: { xs: 1, md: 0 },
              flexWrap: 'nowrap',
            }}
          >
            <Button
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              onClick={() => {
                if (selectedWeekIds.length === 0) {
                  setSelectedWeeks(filteredSemanas.map((s) => s.id));
                } else {
                  clearSelection();
                }
              }}
              sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 120 }, px: { xs: 1.5, sm: 2 } }}
            >
              {selectedWeekIds.length === 0 ? 'Selecionar todas' : 'Limpar seleção'}
            </Button>
            <Button
              variant="contained"
              size={isMobile ? 'small' : 'medium'}
              onClick={handleGlobalExportClick}
              sx={{ whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 } }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              size={isMobile ? 'small' : 'medium'}
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: { xs: 40, sm: 'auto' },
                px: { xs: 1.25, sm: 2 },
                height: { xs: 36, sm: 'auto' },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0, sm: 1 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Nova Semana
              </Box>
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            placeholder="Buscar por nome, foco, período (ex: janeiro, 11/01, 01/2026)..."
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
                    <TableCell width={48}>
                      <Checkbox
                        checked={selectedWeekIds.length > 0 && filteredSemanas.every((s) => selectedWeekIds.includes(s.id))}
                        indeterminate={selectedWeekIds.length > 0 && !filteredSemanas.every((s) => selectedWeekIds.includes(s.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWeeks(filteredSemanas.map((s) => s.id));
                          } else {
                            clearSelection();
                          }
                        }}
                        inputProps={{ 'aria-label': 'Selecionar todas as semanas' }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell width={48} />
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
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="600">
                        Ações
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSemanas.map((semana) => (
                    <SemanaRow
                      key={semana.id}
                      semana={semana}
                      onEdit={handleEditWeek}
                      onDelete={handleDeleteWeek}
                      onExport={handleExportWeek}
                    />
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
                <SemanaCard
                  key={semana.id}
                  semana={semana}
                  onEdit={handleEditWeek}
                  onDelete={handleDeleteWeek}
                  onExport={handleExportWeek}
                />
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

      {/* Dialog para criar/editar semana */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingSemanaId ? 'Editar Semana' : 'Nova Semana'}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
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
            {editingSemanaId ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Exportação Rápida */}
      <QuickExportModal
        open={quickExportOpen}
        onClose={() => setQuickExportOpen(false)}
        semanasSelecionadas={quickExportWeeks}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, semanaId: '', semanaNome: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{deleteDialog.semanaNome}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Todos os treinos desta semana serão removidos permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, semanaId: '', semanaNome: '' })}>
            Cancelar
          </Button>
          <Button onClick={confirmDeleteWeek} variant="contained" color="error">
            Excluir
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
