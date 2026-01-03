import { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  DirectionsRun as DirectionsRunIcon,
} from '@mui/icons-material';

// Dados mockados - Focos da Semana
const focosSemanaMockData: FocoSemana[] = [
  { id: 1, nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
  { id: 2, nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
  { id: 3, nome: 'Força Máxima', intensidade: 85, descricao: 'Foco em força máxima' },
  { id: 4, nome: 'Potência', intensidade: 70, descricao: 'Foco em potência muscular' },
  { id: 5, nome: 'Funcional', intensidade: 60, descricao: 'Treino funcional' },
  { id: 6, nome: 'Deload', intensidade: 40, descricao: 'Semana de recuperação ativa' },
];

// Dados mockados - Padrões de Movimento
const padroesMockData = [
  { id: 1, nome: 'Agachar' },
  { id: 2, nome: 'Empurrar Horizontal' },
  { id: 3, nome: 'Empurrar Vertical' },
  { id: 4, nome: 'Puxar Horizontal' },
  { id: 5, nome: 'Puxar Vertical' },
  { id: 6, nome: 'Carregar' },
  { id: 7, nome: 'Core' },
  { id: 8, nome: 'Locomoção' },
];

// Tipos TypeScript
interface FocoSemana {
  id: number;
  nome: string;
  intensidade?: number | null;
  descricao?: string | null;
}

interface PadraoMovimento {
  id: number;
  nome: string;
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
      id: editingData?.id || Date.now(),
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
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Nome do Foco"
            value={formData.nome}
            onChange={handleChange('nome')}
            required
            fullWidth
          />
          <TextField
            label="Intensidade (%)"
            type="number"
            value={formData.intensidade}
            onChange={handleChange('intensidade')}
            inputProps={{ min: 0, max: 100 }}
            fullWidth
          />
          <TextField
            label="Descrição"
            value={formData.descricao}
            onChange={handleChange('descricao')}
            multiline
            rows={3}
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

// Componente do formulário de Padrão de Movimento
function PadraoMovimentoDialog({ open, onClose, onSave, editingData }: PadraoMovimentoDialogProps) {
  const [formData, setFormData] = useState({
    nome: editingData?.nome || '',
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

    const novoPadrao = {
      id: editingData?.id || Date.now(),
      nome: formData.nome.trim(),
    };

    onSave(novoPadrao);
    setFormData({ nome: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingData ? 'Editar Padrão de Movimento' : 'Novo Padrão de Movimento'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Nome do Padrão"
            value={formData.nome}
            onChange={handleChange('nome')}
            required
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
  const [focosSemana, setFocosSemana] = useState<FocoSemana[]>(focosSemanaMockData);
  const [padroes, setPadroes] = useState(padroesMockData);

  // Estado dos diálogos - Foco
  const [focoDialogOpen, setFocoDialogOpen] = useState(false);
  const [editingFoco, setEditingFoco] = useState<FocoSemana | null>(null);

  // Estado dos diálogos - Padrão
  const [padraoDialogOpen, setPadraoDialogOpen] = useState(false);
  const [editingPadrao, setEditingPadrao] = useState<PadraoMovimento | null>(null);

  // Handlers para Focos da Semana
  const handleOpenFocoDialog = (foco: FocoSemana | null = null) => {
    setEditingFoco(foco);
    setFocoDialogOpen(true);
  };

  const handleCloseFocoDialog = () => {
    setFocoDialogOpen(false);
    setEditingFoco(null);
  };

  const handleSaveFoco = (novoFoco: FocoSemana) => {
    if (editingFoco) {
      setFocosSemana((focos) => focos.map((f) => (f.id === novoFoco.id ? novoFoco : f)));
    } else {
      setFocosSemana((focos) => [...focos, novoFoco]);
    }
  };

  const handleDeleteFoco = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este foco da semana?')) {
      setFocosSemana((focos) => focos.filter((f) => f.id !== id));
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

  const handleSavePadrao = (novoPadrao: PadraoMovimento) => {
    if (editingPadrao) {
      setPadroes((padroes) => padroes.map((p) => (p.id === novoPadrao.id ? novoPadrao : p)));
    } else {
      setPadroes((padroes) => [...padroes, novoPadrao]);
    }
  };

  const handleDeletePadrao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este padrão de movimento?')) {
      setPadroes((padroes) => padroes.filter((p) => p.id !== id));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Configurações
        </Typography>
      </Stack>

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
            >
              Novo Padrão
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
                  <TableCell align="center" width={120}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {padroes.map((padrao) => (
                  <TableRow key={padrao.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {padrao.nome}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
