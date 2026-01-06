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

// Dados mockados - Focos da Semana
const focosSemanaMockData: FocoSemana[] = [
  { id: '1', nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
  { id: '2', nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
  { id: '3', nome: 'Força Máxima', intensidade: 85, descricao: 'Foco em força máxima' },
  { id: '4', nome: 'Potência', intensidade: 70, descricao: 'Foco em potência muscular' },
  { id: '5', nome: 'Funcional', intensidade: 60, descricao: 'Treino funcional' },
  { id: '6', nome: 'Deload', intensidade: 40, descricao: 'Semana de recuperação ativa' },
];

// Dados mockados - Padrões de Movimento
const padroesMockData = [
  { id: '1', nome: 'Agachar' },
  { id: '2', nome: 'Empurrar Horizontal' },
  { id: '3', nome: 'Empurrar Vertical' },
  { id: '4', nome: 'Puxar Horizontal' },
  { id: '5', nome: 'Puxar Vertical' },
  { id: '6', nome: 'Carregar' },
  { id: '7', nome: 'Core' },
  { id: '8', nome: 'Locomoção' },
];

// Tipos TypeScript
interface FocoSemana {
  id: string;
  nome: string;
  intensidade?: number | null;
  descricao?: string | null;
}

interface PadraoMovimento {
  id: string;
  nome: string;
  descricao?: string | null;
}

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
    nome: editingData?.nome || '',
    intensidade: editingData?.intensidade || '',
    descricao: editingData?.descricao || '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const novoFoco = {
      id: editingData?.id || crypto.randomUUID(),
      nome: formData.nome.trim(),
      intensidade: formData.intensidade ? parseInt(String(formData.intensidade)) : null,
      descricao: formData.descricao.trim() || null,
    };

    onSave(novoFoco);
    setFormData({ nome: '', intensidade: '', descricao: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingData ? 'Editar Foco da Semana' : 'Novo Foco da Semana'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome do Foco"
              value={formData.nome}
              onChange={handleChange('nome')}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Intensidade (%)"
              type="number"
              value={formData.intensidade}
              onChange={handleChange('intensidade')}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={handleChange('descricao')}
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
    nome: editingData?.nome || '',
    descricao: editingData?.descricao || '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        nome: editingData.nome || '',
        descricao: editingData.descricao || '',
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
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
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const novoPadrao: PadraoMovimento = {
      id: editingData?.id || '',
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || null,
    };

    onSave(novoPadrao);
    setFormData({ nome: '', descricao: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingData ? 'Editar Padrão de Movimento' : 'Novo Padrão de Movimento'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 4 }}>
          <TextField
            label="Nome do Padrão"
            value={formData.nome}
            onChange={handleChange('nome')}
            required
            fullWidth
          />
          <TextField
            label="Descrição"
            value={formData.descricao}
            onChange={handleChange('descricao')}
            multiline
            rows={3}
            placeholder="Descreva o padrão de movimento..."
            fullWidth
          />
        </Stack>
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

      // Mapear movement patterns
      const padroesMapeados = movementPatterns.map((mp: MovementPattern) => ({
        id: mp.id,
        nome: mp.name,
        descricao: mp.description,
      }));

      // Mapear week focuses
      const focosMapeados = weekFocuses.map((wf: WeekFocus) => ({
        id: wf.id,
        nome: wf.name,
        intensidade: null, // WeekFocus não tem intensidade
        descricao: wf.description,
      }));

      setPadroes(padroesMapeados);
      setFocosSemana(focosMapeados);
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
      setLoading(true);
      setError(null);

      if (editingFoco) {
        // Atualizar foco existente
        await weekService.updateWeekFocus(editingFoco.id, {
          name: novoFoco.nome,
          description: novoFoco.descricao,
        });
      } else {
        // Criar novo foco (ou atualizar se já existir com mesmo nome)
        await weekService.createWeekFocus({
          name: novoFoco.nome,
          description: novoFoco.descricao,
        });
      }

      setFocoDialogOpen(false);
      setEditingFoco(null);
      await loadInitialData();
    } catch (err: any) {
      console.error('Erro ao salvar foco da semana:', err);

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
      setError(null);
      if (editingPadrao) {
        // Atualizar padrão existente
        await movementPatternService.updateMovementPattern(
          editingPadrao.id,
          novoPadrao.nome,
          novoPadrao.descricao
        );
        setPadroes((padroes) => padroes.map((p) => (p.id === novoPadrao.id ? novoPadrao : p)));
      } else {
        // Criar novo padrão
        const createdPattern = await movementPatternService.createMovementPattern(
          novoPadrao.nome,
          novoPadrao.descricao
        );
        const novoPadraoMapeado = {
          id: createdPattern.id,
          nome: createdPattern.name,
          descricao: createdPattern.description,
        };
        setPadroes((padroes) => [...padroes, novoPadraoMapeado]);
      }
    } catch (err) {
      console.error('Erro ao salvar padrão:', err);
      setError('Erro ao salvar padrão de movimento. Tente novamente.');
    }
  };

  const handleDeletePadrao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este padrão de movimento?')) {
      try {
        setError(null);
        await movementPatternService.deleteMovementPattern(id);
        setPadroes((padroes) => padroes.filter((p) => p.id !== id));
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
            >
              Novo Foco
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
                        {foco.nome}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {foco.intensidade ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {foco.intensidade}%
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
                                width: `${foco.intensidade}%`,
                                height: '100%',
                                bgcolor:
                                  foco.intensidade >= 70
                                    ? 'error.main'
                                    : foco.intensidade >= 50
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
                        {foco.descricao || 'Sem descrição'}
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
            >
              Novo Padrão
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
                            {padrao.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {padrao.descricao || 'Sem descrição'}
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
    </Container>
  );
};

export default Configuracoes;
