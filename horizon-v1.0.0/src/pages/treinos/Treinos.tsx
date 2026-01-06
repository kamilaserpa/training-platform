import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Stack,
  Fab,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FitnessCenter as FitnessCenterIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

// Tipos TypeScript
interface Exercicio {
  nome: string;
  series?: number;
  repeticoes?: string;
  grupo_muscular?: string;
}

interface Treino {
  id: number;
  nome: string;
  data: string;
  intensidade: number;
  descricao: string;
  blocos?: {
    nome: string;
    exercicios: Exercicio[];
  }[];
  exercicios?: Exercicio[];
  padrao_movimento?: string;
}

// Dados mockados dos treinos
const treinosMock: Treino[] = [
  {
    id: 10,
    nome: 'Treino 01',
    data: '2024-01-15',
    intensidade: 8,
    descricao: 'Foco em exercícios compostos para desenvolvimento da musculatura do peitoral',
    padrao_movimento: 'Empurrar',
    blocos: [
      {
        nome: 'Mobilidade Articular',
        exercicios: [
          { nome: 'Polichinelos', series: 2, repeticoes: '30s', grupo_muscular: 'Cardio' },
          { nome: 'Rotação de Braços', series: 2, repeticoes: '15', grupo_muscular: 'Ombros' },
        ],
      },
      {
        nome: 'Ativação de Core',
        exercicios: [{ nome: 'Prancha', series: 2, repeticoes: '30s', grupo_muscular: 'Cardio' }],
      },
      {
        nome: 'Ativação Neural',
        exercicios: [{ nome: 'Confuso', series: 2, repeticoes: '30s', grupo_muscular: 'Cardio' }],
      },
      {
        nome: 'Bloco 01',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-10', grupo_muscular: 'Peito' },
          { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', grupo_muscular: 'Peito' },
        ],
      },
      {
        nome: 'Bloco 02',
        exercicios: [
          { nome: 'Tríceps Testa', series: 3, repeticoes: '12-15', grupo_muscular: 'Tríceps' },
          { nome: 'Mergulho', series: 3, repeticoes: '10-12', grupo_muscular: 'Tríceps' },
        ],
      },
      {
        nome: 'Condicionamento Físico',
        exercicios: [
          { nome: 'Burpee', series: 3, repeticoes: '12-15', grupo_muscular: 'Cardio' },
          { nome: 'Afundo', series: 3, repeticoes: '10-12', grupo_muscular: 'Pernas' },
        ],
      },
    ],
  },
  {
    id: 1,
    nome: 'Treino A - Peitoral e Tríceps',
    data: '2024-01-15',
    intensidade: 8,
    descricao: 'Foco em exercícios compostos para desenvolvimento da musculatura do peitoral',
    padrao_movimento: 'Empurrar',
    blocos: [
      {
        nome: 'Mobilidade Articular',
        exercicios: [
          { nome: 'Rotação de Ombros', series: 2, repeticoes: '15', grupo_muscular: 'Ombros' },
          { nome: 'Alongamento de Peito', series: 2, repeticoes: '30s', grupo_muscular: 'Peito' },
        ],
      },
      {
        nome: 'Ativação de Core',
        exercicios: [
          { nome: 'Prancha', series: 2, repeticoes: '30s', grupo_muscular: 'Core' },
          { nome: 'Dead Bug', series: 2, repeticoes: '10', grupo_muscular: 'Core' },
        ],
      },
      {
        nome: 'Ativação Neural',
        exercicios: [
          { nome: 'Flexão de Braços', series: 2, repeticoes: '8', grupo_muscular: 'Peito' },
        ],
      },
      {
        nome: 'Bloco 01',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '8-10', grupo_muscular: 'Peito' },
          { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', grupo_muscular: 'Peito' },
        ],
      },
      {
        nome: 'Bloco 02',
        exercicios: [
          { nome: 'Tríceps Testa', series: 3, repeticoes: '12-15', grupo_muscular: 'Tríceps' },
          { nome: 'Mergulho', series: 3, repeticoes: '10-12', grupo_muscular: 'Tríceps' },
        ],
      },
    ],
  },
  {
    id: 2,
    nome: 'Treino B - Costas e Bíceps',
    data: '2024-01-16',
    intensidade: 7,
    descricao: 'Trabalho específico para fortalecimento das costas e braços',
    padrao_movimento: 'Puxar',
    blocos: [
      {
        nome: 'Mobilidade Articular',
        exercicios: [
          { nome: 'Rotação de Ombros', series: 2, repeticoes: '15', grupo_muscular: 'Ombros' },
          {
            nome: 'Alongamento de Latíssimo',
            series: 2,
            repeticoes: '30s',
            grupo_muscular: 'Costas',
          },
        ],
      },
      {
        nome: 'Ativação de Core',
        exercicios: [{ nome: 'Bird Dog', series: 2, repeticoes: '10', grupo_muscular: 'Core' }],
      },
      {
        nome: 'Ativação Neural',
        exercicios: [
          { nome: 'Puxada Elástico', series: 2, repeticoes: '15', grupo_muscular: 'Costas' },
        ],
      },
      {
        nome: 'Bloco 01',
        exercicios: [
          { nome: 'Puxada Frente', series: 4, repeticoes: '8-10', grupo_muscular: 'Costas' },
          { nome: 'Remada Curvada', series: 3, repeticoes: '10-12', grupo_muscular: 'Costas' },
        ],
      },
      {
        nome: 'Bloco 02',
        exercicios: [
          { nome: 'Rosca Direta', series: 3, repeticoes: '12-15', grupo_muscular: 'Bíceps' },
          { nome: 'Rosca Martelo', series: 3, repeticoes: '10-12', grupo_muscular: 'Bíceps' },
        ],
      },
    ],
  },
  {
    id: 3,
    nome: 'Treino C - Pernas',
    data: '2024-01-17',
    intensidade: 9,
    descricao: 'Treino intenso focado nos membros inferiores',
    padrao_movimento: 'Agachar',
    blocos: [
      {
        nome: 'Mobilidade Articular',
        exercicios: [
          { nome: 'Rotação de Quadril', series: 2, repeticoes: '15', grupo_muscular: 'Quadril' },
          {
            nome: 'Alongamento de Posterior',
            series: 2,
            repeticoes: '30s',
            grupo_muscular: 'Posterior',
          },
        ],
      },
      {
        nome: 'Ativação de Core',
        exercicios: [
          { nome: 'Prancha Lateral', series: 2, repeticoes: '20s', grupo_muscular: 'Core' },
        ],
      },
      {
        nome: 'Ativação Neural',
        exercicios: [
          { nome: 'Agachamento Livre', series: 2, repeticoes: '10', grupo_muscular: 'Pernas' },
        ],
      },
      {
        nome: 'Bloco 01',
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: '6-8', grupo_muscular: 'Pernas' },
          { nome: 'Leg Press', series: 3, repeticoes: '12-15', grupo_muscular: 'Pernas' },
        ],
      },
      {
        nome: 'Bloco 02',
        exercicios: [
          { nome: 'Stiff', series: 3, repeticoes: '10-12', grupo_muscular: 'Posterior' },
          { nome: 'Panturrilha', series: 4, repeticoes: '15-20', grupo_muscular: 'Panturrilha' },
        ],
      },
    ],
  },
  {
    id: 4,
    nome: 'Cardio HIIT',
    data: '2024-01-18',
    intensidade: 8,
    descricao: 'Treinamento intervalado de alta intensidade',
    padrao_movimento: 'Cardio',
    blocos: [
      {
        nome: 'Mobilidade Articular',
        exercicios: [
          { nome: 'Rotação de Articulações', series: 1, repeticoes: '10', grupo_muscular: 'Geral' },
          { nome: 'Alongamento Dinâmico', series: 1, repeticoes: '30s', grupo_muscular: 'Geral' },
        ],
      },
      {
        nome: 'Ativação de Core',
        exercicios: [{ nome: 'Prancha', series: 1, repeticoes: '30s', grupo_muscular: 'Core' }],
      },
      {
        nome: 'Ativação Neural',
        exercicios: [
          { nome: 'Jumping Jacks', series: 1, repeticoes: '30s', grupo_muscular: 'Cardio' },
        ],
      },
      {
        nome: 'Bloco 01',
        exercicios: [
          { nome: 'Burpees', series: 5, repeticoes: '30s', grupo_muscular: 'Cardio' },
          { nome: 'Mountain Climbers', series: 5, repeticoes: '30s', grupo_muscular: 'Cardio' },
        ],
      },
      {
        nome: 'Bloco 02',
        exercicios: [
          { nome: 'Jump Squats', series: 5, repeticoes: '30s', grupo_muscular: 'Cardio' },
          { nome: 'High Knees', series: 5, repeticoes: '30s', grupo_muscular: 'Cardio' },
        ],
      },
    ],
  },
];

const Treinos = () => {
  const navigate = useNavigate();
  const [treinos] = useState<Treino[]>(treinosMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [intensidadeFilter, setIntensidadeFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('data');

  // Filtros aplicados
  const treinosFiltrados = useMemo(() => {
    return treinos
      .filter((treino) => {
        const matchesSearch =
          treino.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          treino.descricao.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIntensidade =
          intensidadeFilter === 'Todos' || treino.intensidade.toString() === intensidadeFilter;

        return matchesSearch && matchesIntensidade;
      })
      .sort((a, b) => {
        if (sortBy === 'data') {
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        }
        if (sortBy === 'intensidade') {
          return b.intensidade - a.intensidade;
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [treinos, searchTerm, intensidadeFilter, sortBy]);

  // Handlers
  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      console.log(`Excluir treino ID: ${id}`);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/pages/treino-detalhes-form?id=${id}`);
  };

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="700">
          Treinos
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FitnessCenterIcon />}
            onClick={() => navigate('/pages/treino-detalhes-form?defaultBlocks=true')}
            sx={{
              minWidth: { xs: 'auto', md: 180 },
              px: { xs: 1, md: 2 },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Com Blocos Padrão</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Padrão</Box>
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/pages/treino-detalhes-form')}
            sx={{
              minWidth: { xs: 'auto', md: 150 },
              px: { xs: 1, md: 2 },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Novo Treino</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Novo</Box>
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon />
            <Typography variant="h6" fontWeight="600">
              Filtros
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Intensidade</InputLabel>
              <Select
                value={intensidadeFilter}
                onChange={(e) => setIntensidadeFilter(e.target.value)}
                label="Intensidade"
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="9">9-10 (Máxima)</MenuItem>
                <MenuItem value="8">8 (Alta)</MenuItem>
                <MenuItem value="7">7 (Média-Alta)</MenuItem>
                <MenuItem value="6">6 (Média)</MenuItem>
                <MenuItem value="5">≤5 (Baixa)</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="data">Data</MenuItem>
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
                {searchTerm || intensidadeFilter !== 'Todos'
                  ? 'Nenhum treino encontrado'
                  : 'Nenhum treino cadastrado'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchTerm || intensidadeFilter !== 'Todos'
                  ? 'Tente ajustar os filtros para encontrar treinos'
                  : 'Comece criando seu primeiro treino'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<FitnessCenterIcon />}
                  onClick={() => navigate('/pages/treino-detalhes-form?defaultBlocks=true')}
                >
                  Criar com Blocos Padrão
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/pages/treino-detalhes-form')}
                >
                  Criar Treino Vazio
                </Button>
              </Stack>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {treinosFiltrados.map((treino) => (
                <Grid item xs={12} sm={6} md={4} key={treino.id}>
                  <Card
                    variant="outlined"
                    sx={{
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
                        {treino.nome}
                      </Typography>

                      {/* Padrão de Movimento */}
                      {treino.padrao_movimento && (
                        <Chip
                          label={`${treino.padrao_movimento}`}
                          size="small"
                          // variant="outlined"
                          color="secondary"
                          sx={{ mb: 2 }}
                        />
                      )}

                      {/* Data completa */}
                      <Chip label={formatDate(treino.data)} />

                      {/* Dia semana */}
                      <Chip
                        label="Sem. 01"
                        color={getIntensityColor(treino.intensidade)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                      {/* Observações */}
                      {treino.descricao && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            mb: 2,
                          }}
                        >
                          {treino.descricao}
                        </Typography>
                      )}

                      {/* Estrutura dos Blocos */}
                      {treino.blocos && treino.blocos.length > 0 ? (
                        <Box>
                          {/* <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="primary.main"
                            gutterBottom
                            sx={{ fontSize: '0.9rem' }}
                          >
                            Estrutura ({treino.blocos.length} blocos)
                          </Typography> */}
                          <Box>
                            {treino.blocos.map((bloco, blocoIndex) => (
                              <Box key={blocoIndex} sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="secondary.main"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    mb: 0.5,
                                  }}
                                >
                                  {bloco.nome}
                                </Typography>
                                {bloco.exercicios.map((exercicio, exIndex) => (
                                  <Typography
                                    key={exIndex}
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      py: 0.25,
                                      pl: 1,
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    <span>• {exercicio.nome}</span>
                                    {exercicio.series && exercicio.repeticoes && (
                                      <span style={{ fontWeight: 600 }}>
                                        {exercicio.series}x{exercicio.repeticoes}
                                      </span>
                                    )}
                                  </Typography>
                                ))}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ) : (
                        /* Fallback para exercícios diretos (caso não tenha blocos) */
                        treino.exercicios &&
                        treino.exercicios.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              color="primary.main"
                              gutterBottom
                              sx={{ fontSize: '0.9rem' }}
                            >
                              Exercícios ({treino.exercicios.length})
                            </Typography>
                            <Box>
                              {treino.exercicios.map((exercicio, index) => (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 0.25,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  <span>{exercicio.nome}</span>
                                  {exercicio.series && exercicio.repeticoes && (
                                    <span style={{ fontWeight: 600 }}>
                                      {exercicio.series}x{exercicio.repeticoes}
                                    </span>
                                  )}
                                </Typography>
                              ))}
                              {treino.exercicios.length > 4 && (
                                <Typography
                                  variant="caption"
                                  color="primary.main"
                                  sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}
                                >
                                  +{treino.exercicios.length - 4} exercícios...
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )
                      )}
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                      <Button
                        startIcon={<PlayArrowIcon />}
                        size="small"
                        onClick={() => handleEdit(treino.id)}
                      >
                        Detalhes
                      </Button>

                      <Box>
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
                            <DeleteIcon fontSize="small" />
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
        onClick={() => navigate('/pages/treino-detalhes-form')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Treinos;
