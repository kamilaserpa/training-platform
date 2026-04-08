import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FitnessCenter as FitnessCenterIcon,
  PictureAsPdf as PdfIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo-main.png';
import { trainingService } from '../../services/trainingService';
import type { Training } from '../../types/database.types';
import { generateSemanaPDF } from '../../utils/pdf/generateSemanaPDF';
import { generateTreinoPDF } from '../../utils/pdf/generateTreinoPDF';
import { imageToBase64 } from '../../utils/pdf/pdfUtils';

const Treinos = () => {
  const navigate = useNavigate();
  const [treinos, setTreinos] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando treinos...');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('data-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reloadSeq, setReloadSeq] = useState(0);

  // Carregar treinos do banco de dados
  useEffect(() => {
    let isMounted = true;

    const loadTreinos = async () => {
      try {
        setLoading(true)
        setLoadingMessage('Carregando treinos...')
        setError(null)

        const isSessionTimeoutError = (err: unknown) => {
          const obj = err && typeof err === 'object' ? (err as Record<string, unknown>) : null;
          const name = obj?.name != null ? String(obj.name) : '';
          const msg = obj?.message != null ? String(obj.message) : '';
          return (
            name === 'TimeoutError' &&
            (msg.includes('obtendo sessão') || msg.includes('obtendo sessao'))
          );
        };

        // UX: se o auth ainda não “subiu”, tentar automaticamente com backoff.
        // Evita o usuário ficar clicando “Tentar novamente”.
        const backoffMs = [1000, 2000, 4000];
        let treinosData: Awaited<ReturnType<typeof trainingService.getAllTrainings>> = [];
        let lastErr: unknown = null;

        for (let attempt = 0; attempt <= backoffMs.length; attempt++) {
          try {
            if (attempt > 0) {
              setLoadingMessage('Conectando...')
            }

            treinosData = await trainingService.getAllTrainings()
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            if (!isSessionTimeoutError(e) || attempt === backoffMs.length) {
              throw e;
            }

            const waitMs = backoffMs[attempt] ?? 0;
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            if (!isMounted) return;
          }
        }

        if (lastErr) throw lastErr;

        if (!isMounted) return;

        // Dados otimizados: apenas informações essenciais para a listagem
        // Blocos e exercícios são carregados sob demanda na tela de detalhe
        setTreinos(treinosData)

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Erro ao carregar treinos:', err)
        setError(err.message || 'Erro ao carregar treinos')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTreinos()

    return () => {
      isMounted = false;
    };
  }, [reloadSeq])

  // Filtros aplicados
  const treinosFiltrados = useMemo(() => {
    return treinos
      .filter((treino) => {
        const matchesSearch =
          (treino.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (treino.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'data-desc') {
          return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
        }
        if (sortBy === 'data-asc') {
          return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
        }
        if (sortBy === 'intensidade') {
          return (b.intensity_level || 5) - (a.intensity_level || 5);
        }
        return a.name.localeCompare(b.name);
      });
  }, [treinos, searchTerm, sortBy]);

  // Handlers
  const [deleteDialog, setDeleteDialog] = useState({ open: false, treinoId: '', treinoNome: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleDelete = (id: string) => {
    const treino = treinos.find(t => t.id === id);
    setDeleteDialog({ open: true, treinoId: id, treinoNome: treino?.name || 'este treino' });
  };

  const confirmDeleteTraining = async () => {
    const { treinoId } = deleteDialog;
    setDeleteDialog({ open: false, treinoId: '', treinoNome: '' });
    try {
      await trainingService.deleteTraining(treinoId);
      setTreinos(prev => prev.filter(t => t.id !== treinoId));
      setSnackbar({ open: true, message: 'Treino excluído com sucesso!', severity: 'success' });
    } catch (error: any) {
      console.error('❌ Erro ao excluir treino:', error);
      setSnackbar({ open: true, message: error?.message || 'Erro ao excluir treino. Tente novamente.', severity: 'error' });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/pages/treinos/${id}/editar`);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/pages/treinos/${id}`);
  };

  // Handler para exportar PDF
  const handleExportPDF = async (treino: Training) => {
    try {
      const logoBase64 = await imageToBase64(logoImage);
      await generateTreinoPDF(treino, logoBase64);
    } catch (error: any) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF: ' + error.message);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleExportSelected = async () => {
    try {
      const selected = treinos.filter(t => selectedIds.has(t.id));
      if (selected.length === 0) return;
      const semanaName = selected[0]?.training_week?.name
        ? `Semana ${selected[0].training_week.name}`
        : `Selecionados (${selected.length})`;
      const semana = {
        name: semanaName,
        week_focus: selected[0]?.training_week?.week_focus || undefined,
        start_date: selected[0]?.scheduled_date || undefined,
        end_date: selected[selected.length - 1]?.scheduled_date || undefined,
        description: undefined,
      } as any;

      const logoBase64 = await imageToBase64(logoImage);
      await generateSemanaPDF(semana, selected, logoBase64);
    } catch (error: any) {
      console.error('❌ Erro ao gerar PDF da seleção:', error);
      alert('Erro ao gerar PDF da seleção: ' + error.message);
    }
  };

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    // Garantir que a data seja interpretada como local (não UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexado

    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'error';
    if (intensity >= 6) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 0, sm: 3 } }}>
      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">{loadingMessage}</Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Grid container spacing={2} direction="column" alignItems="center" sx={{ width: '100%', maxWidth: 520 }}>
            <Grid item>
              <Typography variant="h6" color="error">Erro ao carregar treinos</Typography>
            </Grid>
            <Grid item>
              <Typography color="text.secondary" align="center">{error}</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => setReloadSeq((s) => s + 1)}
              >
                Tentar Novamente
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Content - apenas quando não está carregando e não há erro */}
      {!loading && !error && (
        <>
          {/* Dialog de confirmação de exclusão do treino */}
          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, treinoId: '', treinoNome: '' })}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              <Typography>
                Tem certeza que deseja excluir <strong>{deleteDialog.treinoNome}</strong>?
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                ⚠️ Esta ação não pode ser desfeita.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog({ open: false, treinoId: '', treinoNome: '' })}>
                Cancelar
              </Button>
              <Button onClick={confirmDeleteTraining} variant="contained" color="error">
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

          {/* Header - mesmo padrão da listagem de semanas */}
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-start' }} spacing={{ xs: 2, md: 0 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="700" gutterBottom>
                  Treinos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualize e gerencie seus treinos
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                sx={{
                  mt: { xs: 1, md: 0 },
                  flexWrap: 'nowrap',
                }}
              >
                <Button
                  variant="outlined"
                  size="medium"
                  disabled={selectedIds.size === 0}
                  onClick={clearSelection}
                  sx={{ whiteSpace: 'nowrap', minWidth: { xs: 'auto', sm: 120 }, px: { xs: 1.5, sm: 2 } }}
                >
                  Limpar seleção
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  disabled={selectedIds.size === 0}
                  onClick={handleExportSelected}
                  startIcon={<PdfIcon />}
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: { xs: 48, md: 'auto' },
                    px: { xs: 1.5, md: 2 },
                    height: { xs: 40, md: 'auto' },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, md: 1 },
                      display: 'inherit',
                      flexShrink: 0,
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    Exportar Selecionado
                  </Box>
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/pages/treinos/novo')}
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: { xs: 48, md: 'auto' },
                    px: { xs: 1.5, md: 2 },
                    height: { xs: 40, md: 'auto' },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, md: 1 },
                      display: 'inherit',
                      flexShrink: 0,
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    Novo Treino
                  </Box>
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Filtros */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ py: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={4}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <TextField
                  label="Buscar treino"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  size="small"
                  sx={{ flex: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Ordenar por"
                  >
                    <MenuItem value="data-desc">Data (mais recente)</MenuItem>
                    <MenuItem value="data-asc">Data (mais antigo)</MenuItem>
                    <MenuItem value="intensidade">Intensidade</MenuItem>
                    <MenuItem value="nome">Nome</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* Lista de Treinos */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  Treinos Encontrados ({treinosFiltrados.length})
                </Typography>
              </Box>

              {treinosFiltrados.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <FitnessCenterIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm
                      ? 'Nenhum treino encontrado'
                      : 'Nenhum treino cadastrado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {searchTerm
                      ? 'Tente ajustar os filtros para encontrar treinos'
                      : 'Comece criando seu primeiro treino'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/pages/treinos/novo')}
                  >
                    Criar Primeiro Treino
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {treinosFiltrados.map((treino) => (
                    <Grid item xs={12} sm={6} md={4} key={treino.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 0,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out',
                          },
                        }}
                      >
                        {/* Header do Card */}
                        <Box
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: { xs: 1.5, sm: 2 },
                            position: 'relative',
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            sx={{
                              fontSize: '1.1rem',
                              lineHeight: 1.3,
                              mb: 1,
                            }}
                          >
                            <ButtonBase
                              onClick={() => handleViewDetail(treino.id)}
                              aria-label={`Abrir treino ${treino.name}`}
                              sx={{
                                display: 'block',
                                textAlign: 'left',
                                width: '100%',
                                color: 'inherit',
                                borderRadius: 1,
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                                '&:focus-visible': {
                                  outline: '2px solid rgba(255,255,255,0.9)',
                                  outlineOffset: 2,
                                },
                              }}
                            >
                              {treino.name}
                            </ButtonBase>
                          </Typography>

                          {/* Padrão de Movimento */}
                          {treino.movement_pattern?.name && (
                            <Chip
                              label={`${treino.movement_pattern.name}`}
                              size="small"
                              variant="filled"
                              color="secondary"
                              sx={{ mb: 2 }}
                            />
                          )}

                          {/* Data completa */}
                          <Chip label={formatDate(treino.scheduled_date)}
                            size="small"
                            variant="filled"
                            color="primary" />

                          {/* Semana */}
                          <Chip
                            label={treino.training_week?.name ? `S. ${treino.training_week.name}` : 'S. --'}
                            color={getIntensityColor(treino.intensity_level || 5)}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              fontWeight: 600,
                            }}
                          />

                          <Checkbox
                            checked={selectedIds.has(treino.id)}
                            onChange={() => toggleSelected(treino.id)}
                            inputProps={{ 'aria-label': 'Selecionar treino' }}
                            sx={{
                              position: 'absolute',
                              top: 40,
                              right: 8,
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                color: 'white',
                              },
                              '&.Mui-checked': {
                                color: 'white',
                              },
                              '&.Mui-checked:hover': {
                                color: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                              },
                            }}
                          />
                        </Box>

                        <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                          <Button
                            startIcon={<PlayArrowIcon />}
                            size="small"
                            onClick={() => handleViewDetail(treino.id)}
                          >
                            Detalhes
                          </Button>

                          <Box>
                            <Tooltip title="Exportar PDF">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleExportPDF(treino)}
                              >
                                <PdfIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar treino">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(treino.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir treino">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(treino.id)}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Floating Action Button para mobile */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: { xs: 'flex', md: 'none' },
            }}
            onClick={() => navigate('/pages/treinos/novo')}
          >
            <AddIcon />
          </Fab>
        </>
      )}
    </Container>
  );
};

export default Treinos;
