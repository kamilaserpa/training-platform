import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsRun as DirectionsRunIcon,
} from '@mui/icons-material';

// Importar serviços
import { movementPatternService } from '../../services/movementPatternService';
import { weekService } from '../../services/weekService';
import { useAuth } from '../../contexts/AuthContext';
import type { MovementPattern, WeekFocus } from '../../types/database.types';
import { DevModeAlert } from '../../components/DevModeAlert';

// Tipos TypeScript - Usando estrutura direta do banco de dados
type FocoSemana = WeekFocus; // Usando diretamente o tipo do banco
type PadraoMovimento = MovementPattern; // Usando diretamente o tipo do banco

// Tipos para criação (sem campos auto-gerados)
type CreateFocoSemana = Omit<WeekFocus, 'id' | 'created_at' | 'updated_at' | 'color_hex'>;
type CreatePadraoMovimento = Omit<MovementPattern, 'id' | 'created_at' | 'updated_at'>;

interface FocoSemanaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (foco: FocoSemana) => void;
  editingData?: FocoSemana | null;
}

interface PadraoMovimentoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (padrao: PadraoMovimento) => void;
  editingData?: PadraoMovimento | null;
}

// Componente do formulário de Foco da Semana
function FocoSemanaDialog({ open, onClose, onSave, editingData }: FocoSemanaDialogProps) {
  const [formData, setFormData] = useState({
    name: editingData?.name || '',
    intensity_percentage: editingData?.intensity_percentage || '',
    description: editingData?.description || '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        intensity_percentage: editingData.intensity_percentage || '',
        description: editingData.description || '',
      });
    } else {
      setFormData({
        name: '',
        intensity_percentage: '',
        description: '',
      });
    }
  }, [editingData]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const novoFoco: CreateFocoSemana & { id?: string } = {
      ...(editingData?.id && { id: editingData.id }),
      name: formData.name.trim(),
      intensity_percentage: formData.intensity_percentage ? parseInt(String(formData.intensity_percentage)) : undefined,
      description: formData.description.trim() || undefined,
    };

    onSave(novoFoco as FocoSemana);
    setFormData({ name: '', intensity_percentage: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingData ? 'Editar Foco da Semana' : 'Novo Foco da Semana'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome do Foco"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Intensidade (%)"
              type="number"
              value={formData.intensity_percentage}
              onChange={handleChange('intensity_percentage')}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
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
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Componente do formulário de Padrão de Movimento
function PadraoMovimentoDialog({ open, onClose, onSave, editingData }: PadraoMovimentoDialogProps) {
  const [formData, setFormData] = useState({
    name: editingData?.name || '',
    description: editingData?.description || '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        description: editingData.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [editingData]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const novoPadrao: CreatePadraoMovimento & { id?: string } = {
      ...(editingData?.id && { id: editingData.id }),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    };

    onSave(novoPadrao as PadraoMovimento);
    setFormData({ name: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingData ? 'Editar Padrão de Movimento' : 'Novo Padrão de Movimento'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
          <TextField
            label="Nome do Padrão"
            value={formData.name}
            onChange={handleChange('name')}
            required
            fullWidth
          />
          </Grid>
          <Grid item xs={12}>
          <TextField
            label="Descrição"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            placeholder="Descreva o padrão de movimento..."
            fullWidth
          />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const Configuracoes = () => {
  const auth = useAuth();
  const [focosSemana, setFocosSemana] = useState<FocoSemana[]>([]);
  const [padroes, setPadroes] = useState<PadraoMovimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos diálogos - Foco
  const [focoDialogOpen, setFocoDialogOpen] = useState(false);
  const [editingFoco, setEditingFoco] = useState<FocoSemana | null>(null);

  // Estado dos diálogos - Padrão
  const [padraoDialogOpen, setPadraoDialogOpen] = useState(false);
  const [editingPadrao, setEditingPadrao] = useState<PadraoMovimento | null>(null);

  // Estados para feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [movementPatterns, weekFocuses] = await Promise.all([
        movementPatternService.getAllMovementPatterns(),
        weekService.getAllWeekFocuses(),
      ]);

      // Usar dados diretamente sem mapeamento
      setPadroes(movementPatterns);
      setFocosSemana(weekFocuses);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      
      // Verificar se é erro de autenticação
      if (err?.message?.includes('Invalid Refresh Token') || err?.message?.includes('refresh_token_not_found')) {
        console.log('🔄 [Auth] Token inválido detectado na inicialização, limpando sessão...');
        await auth.clearSession();
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Erro ao carregar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Focos da Semana
  const handleOpenFocoDialog = (foco: FocoSemana | null = null) => {
    setEditingFoco(foco);
    setFocoDialogOpen(true);
  };

  const handleCloseFocoDialog = () => {
    setFocoDialogOpen(false);
    setEditingFoco(null);
  };

  const handleSaveFoco = async (novoFoco: FocoSemana) => {
    try {
      console.log('💾 [Configuracoes] Salvando foco da semana:', novoFoco);
      setLoading(true);
      setError(null);

      if (editingFoco) {
        // Atualizar foco existente
        console.log('🔄 [Configuracoes] Atualizando foco existente:', editingFoco.id);
        await weekService.updateWeekFocus(editingFoco.id, {
          name: novoFoco.name,
          description: novoFoco.description,
          intensity_percentage: novoFoco.intensity_percentage,
        });
        console.log('✅ [Configuracoes] Foco atualizado com sucesso');
      } else {
        // Criar novo foco
        console.log('✨ [Configuracoes] Criando novo foco');
        await weekService.createWeekFocus({
          name: novoFoco.name,
          description: novoFoco.description,
          intensity_percentage: novoFoco.intensity_percentage,
        });
        console.log('✅ [Configuracoes] Foco criado com sucesso');
      }

      setFocoDialogOpen(false);
      setEditingFoco(null);
      await loadInitialData();
      
      // Mostrar mensagem de sucesso
      setSuccessMessage(editingFoco 
        ? `Foco da semana "${novoFoco.name}" atualizado com sucesso!`
        : `Foco da semana "${novoFoco.name}" criado com sucesso!`
      );
      setShowSuccess(true);
    } catch (err: any) {
      console.error('❌ [Configuracoes] Erro ao salvar foco da semana:', err);

      // Verificar se é erro de autenticação
      if (err?.message?.includes('Invalid Refresh Token') || err?.message?.includes('refresh_token_not_found')) {
        console.log('🔄 [Auth] Token inválido detectado, limpando sessão...');
        await auth.clearSession();
        setError('Sessão expirada. Por favor, faça login novamente.');
        // Opcional: redirecionar para login
        // navigate('/login');
      } else if (err?.code === '23505' && err?.message?.includes('week_focuses_name_key')) {
        setError('Já existe um foco com este nome. Tente um nome diferente.');
      } else {
        setError('Erro ao salvar foco da semana. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFoco = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este foco da semana?')) {
      try {
        setLoading(true);
        setError(null);
        await weekService.deleteWeekFocus(id);
        await loadInitialData();
      } catch (err) {
        console.error('Erro ao deletar foco da semana:', err);
        setError('Erro ao deletar foco da semana. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers para Padrões de Movimento
  const handleOpenPadraoDialog = (padrao: PadraoMovimento | null = null) => {
    setEditingPadrao(padrao);
    setPadraoDialogOpen(true);
  };

  const handleClosePadraoDialog = () => {
    setPadraoDialogOpen(false);
    setEditingPadrao(null);
  };

  const handleSavePadrao = async (novoPadrao: PadraoMovimento) => {
    try {
      console.log('💾 [Configuracoes] Salvando padrão de movimento:', novoPadrao);
      setError(null);
      
      if (editingPadrao) {
        // Atualizar padrão existente
        console.log('🔄 [Configuracoes] Atualizando padrão existente:', editingPadrao.id);
        await movementPatternService.updateMovementPattern(
          editingPadrao.id,
          novoPadrao.name,
          novoPadrao.description
        );
        setPadroes((padroes) => padroes.map((p) => (p.id === novoPadrao.id ? novoPadrao : p)));
        console.log('✅ [Configuracoes] Padrão atualizado com sucesso');
        
        setSuccessMessage(`Padrão de movimento "${novoPadrao.name}" atualizado com sucesso!`);
      } else {
        // Criar novo padrão
        console.log('✨ [Configuracoes] Criando novo padrão');
        const createdPattern = await movementPatternService.createMovementPattern(
          novoPadrao.name,
          novoPadrao.description
        );
        // Usar o padrão retornado diretamente
        setPadroes((padroes) => [...padroes, createdPattern]);
        console.log('✅ [Configuracoes] Padrão criado com sucesso');
        
        setSuccessMessage(`Padrão de movimento "${novoPadrao.name}" criado com sucesso!`);
      }
      
      setPadraoDialogOpen(false);
      setEditingPadrao(null);
      setShowSuccess(true);
    } catch (err) {
      console.error('❌ [Configuracoes] Erro ao salvar padrão:', err);
      setError('Erro ao salvar padrão de movimento. Tente novamente.');
    }
  };

  const handleDeletePadrao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este padrão de movimento?')) {
      try {
        setError(null);
        // Encontrar o nome do padrão para o feedback
        const padrao = padroes.find(p => p.id === id);
        const padraoName = padrao?.name || 'Padrão';
        
        await movementPatternService.deleteMovementPattern(id);
        setPadroes((padroes) => padroes.filter((p) => p.id !== id));
        
        setSuccessMessage(`Padrão de movimento "${padraoName}" excluído com sucesso!`);
        setShowSuccess(true);
      } catch (err) {
        console.error('Erro ao deletar padrão:', err);
        setError('Erro ao deletar padrão de movimento. Tente novamente.');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Dev Mode Alert */}
      <DevModeAlert />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Configurações
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Seção: Focos da Semana */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h5">Focos da Semana</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFocoDialog()}
              sx={{
                minWidth: { xs: 40, sm: 'auto' },
                px: { xs: 1, sm: 2 },
                '& .MuiButton-startIcon': {
                  margin: { xs: 0, sm: '0 8px 0 -4px' },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Novo Foco
              </Box>
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">Intensidade</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="center" width={120}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {focosSemana.map((foco) => (
                  <TableRow key={foco.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {foco.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {foco.intensity_percentage ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {foco.intensity_percentage}%
                          </Typography>
                          <Box
                            sx={{
                              width: 40,
                              height: 6,
                              bgcolor: 'grey.200',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${foco.intensity_percentage}%`,
                                height: '100%',
                                bgcolor:
                                  foco.intensity_percentage >= 70
                                    ? 'error.main'
                                    : foco.intensity_percentage >= 50
                                      ? 'warning.main'
                                      : 'success.main',
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {foco.description || 'Sem descrição'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Editar foco">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenFocoDialog(foco)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir foco">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteFoco(foco.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Seção: Padrões de Movimento */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <DirectionsRunIcon color="primary" />
              <Typography variant="h5">Padrões de Movimento</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenPadraoDialog()}
              disabled={loading}
              sx={{
                minWidth: { xs: 40, sm: 'auto' },
                px: { xs: 1, sm: 2 },
                '& .MuiButton-startIcon': {
                  margin: { xs: 0, sm: '0 8px 0 -4px' },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Novo Padrão
              </Box>
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="center" width={120}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {padroes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Nenhum padrão de movimento cadastrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    padroes.map((padrao) => (
                      <TableRow key={padrao.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight={500}>
                            {padrao.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {padrao.description || 'Sem descrição'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Editar padrão">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPadraoDialog(padrao)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir padrão">
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePadrao(padrao.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <FocoSemanaDialog
        open={focoDialogOpen}
        onClose={handleCloseFocoDialog}
        onSave={handleSaveFoco}
        editingData={editingFoco}
      />

      <PadraoMovimentoDialog
        open={padraoDialogOpen}
        onClose={handleClosePadraoDialog}
        onSave={handleSavePadrao}
        editingData={editingPadrao}
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
};

export default Configuracoes;
