import { useState } from 'react';
import {
  Container,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Tipos TypeScript
interface FocoSemana {
  nome: string;
  intensidade: number;
  descricao: string;
}

interface Core {
  protocolo: string;
  exercicios: string[];
}

interface TreinoBloco {
  protocolo: string;
  exercicios: string[];
}

interface Treino {
  nome: string;
  diaSemana: string;
  padroes_movimento: string[];
  mobilidade: string[];
  core: Core;
  neural: string;
  treino_bloco1: TreinoBloco;
  treino_bloco2: TreinoBloco | string;
  condicionamento: string;
  [key: string]: unknown; // Index signature para renderCell
}

interface Semana {
  semestre: string;
  numeroSemana: number;
  data_inicio?: string;
  focoSemana: FocoSemana;
  treinos: Treino[];
}
import { useNavigate } from 'react-router-dom';

function TreinoCell({ treino }: { treino: Treino | null }) {
  if (!treino) {
    return <Typography align="center">-</Typography>;
  }

  return (
    <Stack spacing={0.5} alignItems="left">
      <strong>{treino.nome}</strong>
    </Stack>
  );
}

// Dias da semana (colunas)
const diasSemana = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
];

// Focos da semana mockados
const focosSemanaMock = [
  { id: 1, nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
  { id: 2, nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
  { id: 3, nome: 'Força Máxima', intensidade: 85, descricao: 'Foco em força máxima' },
  { id: 4, nome: 'Potência', intensidade: 70, descricao: 'Foco em potência muscular' },
  { id: 5, nome: 'Funcional', intensidade: 60, descricao: 'Treino funcional' },
];

// Definição das linhas da tabela
const linhasTabela = [
  { key: 'nome', label: 'Treino' },
  { key: 'diaSemana', label: 'Dia' },
  { key: 'padroes_movimento', label: 'Padrões Mov.' },
  { key: 'mobilidade', label: 'Mob. Artic.' },
  { key: 'core', label: 'Ativ. Core' },
  { key: 'neural', label: 'Ativ. Neural' },
  { key: 'treino_bloco1', label: 'Tr. Bl 01' },
  { key: 'treino_bloco2', label: 'Tr. Bl 02' },
  { key: 'condicionamento', label: 'Cond. Físico' },
  { key: 'acoes', label: 'Detalhes' },
];

const semanasMock = [
  {
    semestre: '2025.1',
    numeroSemana: 1,
    data_inicio: '2025-03-03',
    focoSemana: { nome: 'Hipertrofia', intensidade: 65, descricao: 'Foco em hipertrofia muscular' },
    treinos: [
      {
        nome: 'Treino 01',
        diaSemana: 'Segunda',
        padroes_movimento: ['Dobrar', 'Puxar Vertical'],
        mobilidade: ['Ombro, Tronco, Quadril, Tornozelo'],
        core: {
          protocolo: '2 x 30"x15"',
          exercicios: ['Prancha', 'OHS'],
        },
        neural: 'Burpee',
        treino_bloco1: {
          protocolo: '8 x 30"x15"',
          exercicios: ['Lev. Terra', 'Cad. Flexora'],
        },
        treino_bloco2: '-',
        condicionamento: 'Burpee Tabata',
      },
      // Mais treinos...
    ],
  },
  {
    semestre: '2025.1',
    numeroSemana: 2,
    focoSemana: { nome: 'Resistência', intensidade: 50, descricao: 'Foco em resistência muscular' },
    treinos: [
      {
        nome: 'Treino 01',
        diaSemana: 'Segunda',
        padroes_movimento: ['Puxar Vertical'],
        mobilidade: ['Escápula, Ombro'],
        core: {
          protocolo: '2 x 45',
          exercicios: ['Hollow Hold'],
        },
        neural: 'Barra Explosiva',
        treino_bloco1: {
          protocolo: '2 x 45',
          exercicios: ['AMRAP 10', 'Barra Fixa', 'Remada'],
        },
        treino_bloco2: '-',
        condicionamento: 'Corrida 1km',
      },
    ],
  },
];

function renderCell(
  treino: Treino | null,
  key: string,
  navigate: (path: string) => void,
): React.ReactNode {
  if (!treino) return <Typography variant="body2">-</Typography>;

  switch (key) {
    case 'nome':
      return <TreinoCell treino={treino} />;

    case 'diaSemana':
      return treino.diaSemana || '-';

    case 'padroes_movimento':
      return treino.padroes_movimento ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {treino.padroes_movimento.map((padrao: string, index: number) => (
            <Chip key={index} label={padrao} size="small" variant="outlined" />
          ))}
        </Stack>
      ) : (
        '-'
      );

    case 'mobilidade':
      return treino.mobilidade?.join(', ');

    case 'core':
      return (
        <>
          <Typography variant="body2">{treino.core?.protocolo}</Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.core?.exercicios?.join(', ')}
          </Typography>
        </>
      );

    case 'treino_bloco1':
      return (
        <>
          <Typography variant="body2">{treino.treino_bloco1?.protocolo}</Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.treino_bloco1?.exercicios?.join(', ')}
          </Typography>
        </>
      );

    case 'treino_bloco2':
      if (typeof treino.treino_bloco2 === 'string') {
        return treino.treino_bloco2 === '-' ? '-' : treino.treino_bloco2;
      }
      return (
        <>
          <Typography variant="body2">{treino.treino_bloco2?.protocolo}</Typography>
          <Typography variant="caption" color="text.secondary">
            {treino.treino_bloco2?.exercicios?.join(', ')}
          </Typography>
        </>
      );

    case 'acoes':
      return treino ? (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`/pages/treino-detalhes-form`)}
          sx={{
            '@media print': {
              display: 'none',
            },
          }}
        >
          Ver
        </Button>
      ) : (
        '-'
      );

    default: {
      const value = treino[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return <Typography variant="body2">{value || '-'}</Typography>;
      }
      return <Typography variant="body2">-</Typography>;
    }
  }
}

// Interfaces para props
interface NovaSemanaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Semana) => void;
  editData?: Semana | null;
}

// Componente do formulário de nova semana
function NovaSemanaDialog({ open, onClose, onSave, editData = null }: NovaSemanaDialogProps) {
  const isEditing = !!editData;

  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    semestre: 1,
    numeroSemana: 1,
    focoSemanaId: '',
    dataInicio: '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (!formData.focoSemanaId) {
      alert('Por favor, selecione um foco da semana');
      return;
    }

    const focoSemana = focosSemanaMock.find((foco) => foco.id === Number(formData.focoSemanaId));
    if (!focoSemana) {
      alert('Foco da semana não encontrado');
      return;
    }
    const semanaData: Semana = {
      semestre: `${formData.ano}.${formData.semestre}`,
      numeroSemana: formData.numeroSemana,
      focoSemana: focoSemana,
      data_inicio: formData.dataInicio || new Date().toISOString().split('T')[0],
      treinos: editData?.treinos || [],
    };

    onSave(semanaData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Semana de Treino' : 'Nova Semana de Treino'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Data de Início (Opcional)"
            type="date"
            value={formData.dataInicio}
            onChange={handleChange('dataInicio')}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Ano"
            type="number"
            value={formData.ano}
            onChange={handleChange('ano')}
            inputProps={{ min: 2020, max: 2030 }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Semestre</InputLabel>
            <Select value={formData.semestre} onChange={handleChange('semestre')} label="Semestre">
              <MenuItem value={1}>1º Semestre</MenuItem>
              <MenuItem value={2}>2º Semestre</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Número da Semana"
            type="number"
            value={formData.numeroSemana}
            onChange={handleChange('numeroSemana')}
            inputProps={{ min: 1, max: 52 }}
            helperText="Ordem de aparição da semana (1, 2, 3...)"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Foco da Semana</InputLabel>
            <Select
              value={formData.focoSemanaId}
              onChange={handleChange('focoSemanaId')}
              label="Foco da Semana"
            >
              {focosSemanaMock.map((foco) => (
                <MenuItem key={foco.id} value={foco.id}>
                  {foco.nome} {foco.intensidade && `(${foco.intensidade}%)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

interface SemanaTableProps {
  semana: Semana;
  navigate: (path: string) => void;
  onEdit: (semana: Semana) => void;
}

function SemanaTable({ semana, navigate, onEdit }: SemanaTableProps) {
  return (
    <Box mb={4}>
      {/* Compact Header */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
        }}
      >
        {/* Linha principal */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            bgcolor: 'grey.50',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            📚 Semana {String(semana.numeroSemana).padStart(2, '0')}
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => onEdit(semana)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              borderRadius: 2,
              minWidth: 'auto',
              textTransform: 'none',
              fontWeight: 500,
              color: 'primary.main',
            }}
          >
            Editar
          </Button>
        </Stack>

        {/* Linha de informações */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Foco */}
            {semana.focoSemana && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🎯 <strong>{semana.focoSemana.nome}</strong>
                {semana.focoSemana.intensidade && ` (${semana.focoSemana.intensidade}%)`}
              </Typography>
            )}

            {/* Data de início */}
            {semana.data_inicio && (
              <>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  📅 Início: {new Date(semana.data_inicio).toLocaleDateString('pt-BR')} •{' '}
                  {semana.semestre}
                </Typography>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4, maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  minWidth: '120px',
                  maxWidth: '120px',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              />
              {diasSemana.map((dia) => (
                <TableCell
                  key={dia.key}
                  align="left"
                  sx={{
                    fontWeight: 600,
                    minWidth: '150px',
                    width: `${100 / diasSemana.length}%`,
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {dia.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {linhasTabela.map((linha) => (
              <TableRow key={linha.key}>
                {/* Coluna fixa da esquerda */}
                <TableCell
                  sx={{
                    fontWeight: 600,
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    minWidth: '120px',
                    maxWidth: '120px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                  }}
                >
                  {linha.label}
                </TableCell>

                {/* Colunas dos dias */}
                {diasSemana.map((dia) => {
                  // Encontra o treino para este dia da semana
                  const treino = semana.treinos.find(
                    (t: Treino) => t.diaSemana?.toLowerCase() === dia.label.toLowerCase(),
                  );

                  return (
                    <TableCell
                      key={dia.key}
                      align="left"
                      sx={{
                        minWidth: '150px',
                        width: `${100 / diasSemana.length}%`,
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        verticalAlign: 'top',
                      }}
                    >
                      {renderCell(treino || null, linha.key, navigate)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function Semanas() {
  const navigate = useNavigate();
  const [semanas, setSemanas] = useState<Semana[]>(semanasMock as Semana[]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSemana, setEditingSemana] = useState<Semana | null>(null);

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    ano: '',
    semestre: '',
    focoSemana: '',
    buscaLivre: '',
  });

  // Função para filtrar semanas
  const semanasFiltradas = semanas.filter((semana) => {
    // Filtro por Ano
    if (filtros.ano) {
      const anoSemana = semana.semestre.split('.')[0];
      if (anoSemana !== filtros.ano) return false;
    }

    // Filtro por Semestre
    if (filtros.semestre) {
      const semestreSemana = semana.semestre.split('.')[1];
      if (semestreSemana !== filtros.semestre) return false;
    }

    // Filtro por Foco da Semana
    if (filtros.focoSemana) {
      if (semana.focoSemana?.nome !== filtros.focoSemana) return false;
    }

    // Busca Livre - busca em múltiplos campos
    if (filtros.buscaLivre) {
      const termo = filtros.buscaLivre.toLowerCase();
      const buscaEm = [
        semana.focoSemana?.nome || '',
        semana.focoSemana?.descricao || '',
        semana.semestre,
        semana.numeroSemana.toString(),
        ...semana.treinos.map((t: Treino) =>
          [
            t.nome || '',
            t.diaSemana || '',
            ...(t.padroes_movimento || []),
            ...(t.mobilidade || []),
            t.neural || '',
          ].join(' '),
        ),
      ]
        .join(' ')
        .toLowerCase();

      if (!buscaEm.includes(termo)) return false;
    }

    return true;
  });

  // Handler para mudanças nos filtros
  const handleFiltroChange = (campo: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: event.target.value,
    }));
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({
      ano: '',
      semestre: '',
      focoSemana: '',
      buscaLivre: '',
    });
  };

  // Opções para os filtros
  const anosDisponiveis = [...new Set(semanas.map((s) => s.semestre.split('.')[0]))].sort();
  const semestresDisponiveis = [...new Set(semanas.map((s) => s.semestre.split('.')[1]))].sort();
  const focosDisponiveis = [
    ...new Set(semanas.map((s) => s.focoSemana?.nome).filter(Boolean)),
  ].sort();

  const handleNovaSemana = (semanaData: Semana, isEditing = false) => {
    if (isEditing && editingSemana) {
      setSemanas((prev) =>
        prev.map((semana) =>
          semana.numeroSemana === editingSemana.numeroSemana &&
          semana.semestre === editingSemana.semestre
            ? { ...semana, ...semanaData }
            : semana,
        ),
      );
    } else {
      setSemanas((prev) => [...prev, semanaData]);
    }
  };

  const handleEditSemana = (semana: Semana) => {
    setEditingSemana(semana);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSemana(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Semanas de Treino
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            minWidth: { xs: 'auto', md: 150 },
            px: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Nova Semana</Box>
        </Button>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ py: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* Título e botão limpar */}
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body1" fontWeight="600">
                Filtros:
              </Typography>
            </Box>

            {/* Campos de filtro em uma linha */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              flex={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Ano</InputLabel>
                <Select value={filtros.ano} onChange={handleFiltroChange('ano')} label="Ano">
                  <MenuItem value="">Todos</MenuItem>
                  {anosDisponiveis.map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Semestre</InputLabel>
                <Select
                  value={filtros.semestre}
                  onChange={handleFiltroChange('semestre')}
                  label="Semestre"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {semestresDisponiveis.map((semestre) => (
                    <MenuItem key={semestre} value={semestre}>
                      {semestre}º Semestre
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Foco da Semana</InputLabel>
                <Select
                  value={filtros.focoSemana}
                  onChange={handleFiltroChange('focoSemana')}
                  label="Foco da Semana"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {focosDisponiveis.map((foco) => (
                    <MenuItem key={foco} value={foco}>
                      {foco}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Busca Livre"
                value={filtros.buscaLivre}
                onChange={handleFiltroChange('buscaLivre')}
                placeholder="Hipertrofia, Agachar..."
                sx={{ minWidth: 200, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 18 }} />
                  ),
                }}
              />
            </Stack>

            {/* Botão limpar e contador */}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {semanasFiltradas.length === semanas.length
                  ? `${semanas.length} semanas`
                  : `${semanasFiltradas.length}/${semanas.length}`}
              </Typography>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={limparFiltros}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Limpar
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Mensagem quando não há resultados */}
      {semanasFiltradas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma semana encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros ou limpar a busca
          </Typography>
        </Paper>
      ) : (
        semanasFiltradas.map((semana) => (
          <SemanaTable
            key={`${semana.semestre}-${semana.numeroSemana}`}
            semana={semana}
            navigate={navigate}
            onEdit={handleEditSemana}
          />
        ))
      )}

      <NovaSemanaDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleNovaSemana}
        editData={editingSemana}
      />
    </Container>
  );
}

export default Semanas;
