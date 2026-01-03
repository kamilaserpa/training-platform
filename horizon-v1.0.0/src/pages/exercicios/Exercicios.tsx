import { useState, useMemo } from 'react';
import {
  Container,
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

// Dados mockados de exercícios
const exerciciosMock = [
  {
    id: 1,
    nome: 'Agachamento Livre',
    padrao_movimento: 'Agachar',
    observacoes: 'Manter o core ativo e descer até 90 graus no joelho',
  },
  {
    id: 2,
    nome: 'Supino Reto',
    padrao_movimento: 'Empurrar Horizontal',
    observacoes: 'Controlar a descida e explodir na subida',
  },
  {
    id: 3,
    nome: 'Barra Fixa',
    padrao_movimento: 'Puxar Vertical',
    observacoes: 'Pegada pronada, descer até extensão completa dos braços',
  },
  {
    id: 4,
    nome: 'Levantamento Terra',
    padrao_movimento: 'Dobrar',
    observacoes: 'Manter coluna neutra durante todo movimento, iniciar movimento pelo quadril',
  },
  {
    id: 5,
    nome: 'Desenvolvimento Militar',
    padrao_movimento: 'Empurrar Vertical',
    observacoes: 'Pressionar a barra acima da cabeça mantendo core estável',
  },
  {
    id: 6,
    nome: 'Remada Curvada',
    padrao_movimento: 'Puxar Horizontal',
    observacoes: 'Inclinar tronco a 45 graus, puxar barra em direção ao abdome',
  },
  {
    id: 7,
    nome: 'Prancha',
    padrao_movimento: '',
    observacoes: 'Exercício isométrico para fortalecimento do core',
  },
  {
    id: 8,
    nome: 'Burpee',
    padrao_movimento: '',
    observacoes: 'Movimento completo: agachamento, prancha, flexão, salto',
  },
];

const padroesList = [
  'Agachar',
  'Empurrar Horizontal',
  'Empurrar Vertical',
  'Puxar Horizontal',
  'Puxar Vertical',
  'Dobrar',
  'Rotação',
  'Locomoção',
  'Unilateral',
  'Isométrico',
];

// Tipos TypeScript
interface Exercicio {
  id: number;
  nome: string;
  padrao_movimento: string;
  observacoes: string;
}

interface ExercicioDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Exercicio) => void;
  editingData: Exercicio | null;
}

// Dialog de formulário para adicionar/editar exercício
function ExercicioDialog({ open, onClose, onSave, editingData }: ExercicioDialogProps) {
  const [formData, setFormData] = useState({
    nome: editingData?.nome || '',
    padrao_movimento: editingData?.padrao_movimento || '',
    observacoes: editingData?.observacoes || '',
  });

  const handleChange =
    (field: string) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } },
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do exercício');
      return;
    }

    const novoExercicio = {
      id: editingData?.id || Date.now(),
      nome: formData.nome.trim(),
      padrao_movimento: formData.padrao_movimento,
      observacoes: formData.observacoes.trim(),
    };

    onSave(novoExercicio);
    setFormData({ nome: '', padrao_movimento: '', observacoes: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editingData ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Nome do Exercício *"
            value={formData.nome}
            onChange={handleChange('nome')}
            placeholder="ex: Agachamento Livre"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Padrão de Movimento</InputLabel>
            <Select
              value={formData.padrao_movimento}
              onChange={handleChange('padrao_movimento')}
              label="Padrão de Movimento"
            >
              <MenuItem value="">Nenhum</MenuItem>
              {padroesList.map((padrao) => (
                <MenuItem key={padrao} value={padrao}>
                  {padrao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Observações"
            value={formData.observacoes}
            onChange={handleChange('observacoes')}
            placeholder="Dicas de execução, cuidados, variações..."
            multiline
            rows={4}
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

const Exercicios = () => {
  const [exercicios, setExercicios] = useState(exerciciosMock);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercicio, setEditingExercicio] = useState<Exercicio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPadrao, setSelectedPadrao] = useState('Todos');

  // Filtros aplicados
  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter((exercicio) => {
      const matchesSearch =
        exercicio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercicio.observacoes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPadrao =
        selectedPadrao === 'Todos' || exercicio.padrao_movimento === selectedPadrao;

      return matchesSearch && matchesPadrao;
    });
  }, [exercicios, searchTerm, selectedPadrao]);

  // Handlers
  const handleOpenDialog = (exercicio: Exercicio | null = null) => {
    setEditingExercicio(exercicio);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExercicio(null);
  };

  const handleSaveExercicio = (novoExercicio: Exercicio) => {
    if (editingExercicio) {
      setExercicios((exercicios) =>
        exercicios.map((ex) => (ex.id === novoExercicio.id ? novoExercicio : ex)),
      );
    } else {
      setExercicios((exercicios) => [...exercicios, novoExercicio]);
    }
  };

  const handleDeleteExercicio = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este exercício?')) {
      setExercicios((exercicios) => exercicios.filter((ex) => ex.id !== id));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Exercícios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            minWidth: { xs: 'auto', md: 150 },
            px: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Novo Exercício</Box>
        </Button>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label="Buscar exercício"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou observações..."
              size="small"
              sx={{ flex: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Padrão de Movimento</InputLabel>
              <Select
                value={selectedPadrao}
                onChange={(e) => setSelectedPadrao(e.target.value)}
                label="Padrão de Movimento"
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {padroesList.map((padrao) => (
                  <MenuItem key={padrao} value={padrao}>
                    {padrao}
                  </MenuItem>
                ))}
                <MenuItem value="">Sem padrão</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabela de Exercícios */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Lista de Exercícios ({exerciciosFiltrados.length})
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Padrão de Movimento</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Observações</strong>
                  </TableCell>
                  <TableCell align="center" width="120">
                    <strong>Ações</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exerciciosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || selectedPadrao !== 'Todos'
                          ? 'Nenhum exercício encontrado com os filtros aplicados'
                          : 'Nenhum exercício cadastrado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  exerciciosFiltrados.map((exercicio) => (
                    <TableRow key={exercicio.id} hover>
                      <TableCell>
                        <Typography fontWeight="600">{exercicio.nome}</Typography>
                      </TableCell>
                      <TableCell>
                        {exercicio.padrao_movimento || (
                          <Typography variant="body2" color="text.secondary">
                            Sem padrão definido
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: '300px',
                          }}
                        >
                          {exercicio.observacoes || 'Sem observações'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Editar exercício">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(exercicio)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir exercício">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteExercicio(exercicio.id)}
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
        </CardContent>
      </Card>

      {/* Dialog de formulário */}
      <ExercicioDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveExercicio}
        editingData={editingExercicio}
      />
    </Container>
  );
};

export default Exercicios;
