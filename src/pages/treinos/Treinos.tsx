import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService } from '../../services/trainingService';
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
  name: string;
  sets?: number;
  reps?: string;
  duration_seconds?: number;
  rest_seconds?: number;
  muscle_group?: string;
}

interface TrainingBlock {
  name: string;
  exercise_prescriptions: {
    exercise?: {
      name: string;
      muscle_groups?: string[];
    };
    sets?: number;
    reps?: string;
    duration_seconds?: number;
    rest_seconds?: number;
    protocol?: string;  // Campo calculado para exibição
  }[];
}

interface Treino {
  id: string;
  name: string;
  scheduled_date: string;
  intensity_level?: number;
  description?: string;
  training_week?: {
    name: string;
    week_focus?: {
      name: string;
    };
  };
  movement_pattern?: {
    name: string;
  };
  training_blocks?: TrainingBlock[];
}

// Dados mockados dos treinos
const treinosMock: Treino[] = [
  {
    id: "10",
    name: 'Treino S01-05 Empurrar',
    scheduled_date: '2024-01-15',
    intensity_level: 8,
    description: 'Foco em exercícios compostos para desenvolvimento da musculatura do peitoral',
    movement_pattern: {
      name: 'Empurrar'
    },
    training_week: {
      name: '01-05'
    },
    training_blocks: [
      {
        name: 'Mobilidade Articular',
        exercise_prescriptions: [
          {
            exercise: { name: 'Polichinelos', muscle_groups: ['Cardio'] },
            sets: 2,
            duration_seconds: 30,
            rest_seconds: 15
          },
          {
            exercise: { name: 'Rotação de Braços', muscle_groups: ['Ombros'] },
            sets: 2,
            reps: '15',
            rest_seconds: 30
          }
        ]
      },
      {
        name: 'Ativação de Core',
        exercise_prescriptions: [
          {
            exercise: { name: 'Prancha', muscle_groups: ['Core'] },
            sets: 2,
            duration_seconds: 30,
            rest_seconds: 60
          }
        ]
      },
      {
        name: 'Ativação Neural',
        exercise_prescriptions: [
          {
            exercise: { name: 'Flexão Facilitada', muscle_groups: ['Peito'] },
            sets: 2,
            duration_seconds: 30,
            rest_seconds: 60
          }
        ]
      },
      {
        name: 'Bloco Principal 1',
        exercise_prescriptions: [
          {
            exercise: { name: 'Supino Reto', muscle_groups: ['Peito'] },
            sets: 4,
            reps: '8-10',
            rest_seconds: 120
          },
          {
            exercise: { name: 'Supino Inclinado', muscle_groups: ['Peito'] },
            sets: 3,
            reps: '10-12',
            rest_seconds: 90
          }
        ]
      },
      {
        name: 'Bloco Principal 2',
        exercise_prescriptions: [
          {
            exercise: { name: 'Tríceps Testa', muscle_groups: ['Tríceps'] },
            sets: 3,
            reps: '12-15',
            rest_seconds: 60
          },
          {
            exercise: { name: 'Mergulho', muscle_groups: ['Tríceps'] },
            sets: 3,
            reps: '10-12',
            rest_seconds: 60
          }
        ]
      },
      {
        name: 'Condicionamento Físico',
        exercise_prescriptions: [
          {
            exercise: { name: 'Burpee', muscle_groups: ['Cardio'] },
            sets: 3,
            reps: '12-15',
            rest_seconds: 30
          }
        ]
      }
    ]
  }
];

const Treinos = () => {
  const navigate = useNavigate();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [intensidadeFilter, setIntensidadeFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('data');

  // Carregar treinos do banco de dados
  useEffect(() => {
    const loadTreinos = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 [Treinos] Carregando treinos do banco...')
        const treinosData = await trainingService.getAllTrainings()

        // Mapear blocos e exercícios com estrutura do banco
        const treinosFormatted = treinosData.map(treino => ({
          ...treino,
          training_blocks: treino.training_blocks?.map(block => ({
            ...block,
            exercise_prescriptions: block.exercise_prescriptions?.map(prescription => {
              // Construir protocolo completo considerando tempo e intervalo
              let protocolo = ''
              if (prescription.sets) {
                protocolo += `${prescription.sets}x`
              }
              if (prescription.duration_seconds && prescription.duration_seconds > 0) {
                protocolo += `${prescription.duration_seconds}"`
              } else if (prescription.reps) {
                protocolo += prescription.reps
              }
              if (prescription.rest_seconds && prescription.rest_seconds > 0) {
                protocolo += `x${prescription.rest_seconds}"`
              }
              
              return {
                ...prescription,
                protocol: protocolo || ''
              }
            }) || []
          })) || []
        }))

        setTreinos(treinosFormatted)
        console.log('✅ [Treinos] Carregados', treinosFormatted.length, 'treinos')
        console.log('🔍 [DEBUG] Primeiro treino com estrutura completa:', treinosFormatted[0])

      } catch (err: any) {
        console.error('❌ [Treinos] Erro ao carregar treinos:', err)
        setError(err.message || 'Erro ao carregar treinos')
      } finally {
        setLoading(false)
      }
    }

    loadTreinos()
  }, [])

  // Filtros aplicados
  const treinosFiltrados = useMemo(() => {
    return treinos
      .filter((treino) => {
        const matchesSearch =
          (treino.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (treino.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIntensidade =
          intensidadeFilter === 'Todos' || (treino.intensity_level || 5).toString() === intensidadeFilter;

        return matchesSearch && matchesIntensidade;
      })
      .sort((a, b) => {
        if (sortBy === 'data') {
          return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
        }
        if (sortBy === 'intensidade') {
          return (b.intensity_level || 5) - (a.intensity_level || 5);
        }
        return a.name.localeCompare(b.name);
      });
  }, [treinos, searchTerm, intensidadeFilter, sortBy]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      try {
        await trainingService.deleteTraining(id);
        // Recarregar a lista
        setTreinos(prev => prev.filter(t => t.id !== id));
        console.log(`✅ Treino ${id} excluído com sucesso`);
      } catch (error: any) {
        console.error('❌ Erro ao excluir treino:', error);
        alert('Erro ao excluir treino: ' + error.message);
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/pages/treino-detalhes-form?id=${id}`);
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
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">Carregando treinos...</Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" color="error">Erro ao carregar treinos</Typography>
            <Typography color="text.secondary">{error}</Typography>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </Stack>
        </Box>
      )}

      {/* Content - apenas quando não está carregando e não há erro */}
      {!loading && !error && (
        <>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" fontWeight="700">
              Treinos
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/pages/treino-detalhes-form')}
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
                            {treino.name}
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
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                          {/* Observações */}
                          {treino.description && (
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
                              {treino.description}
                            </Typography>
                          )}

                          {/* Estrutura dos Blocos */}
                          {treino.training_blocks && treino.training_blocks.length > 0 ? (
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
                                {treino.training_blocks.map((block, blockIndex) => (
                                  <Box key={blockIndex} sx={{ mb: 1 }}>
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
                                      {block.name}
                                    </Typography>
                                    {block.exercise_prescriptions?.map((prescription, exIndex) => (
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
                                        <span>• {prescription.exercise?.name || 'Exercício'}</span>
                                        {prescription.protocol && (
                                          <span style={{ fontWeight: 600 }}>
                                            {prescription.protocol}
                                          </span>
                                        )}
                                      </Typography>
                                    ))}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          ) : (
                            /* Fallback quando não há blocos definidos */
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontStyle: 'italic',
                                  display: 'block',
                                  textAlign: 'center',
                                  py: 2
                                }}
                              >
                                Treino criado - blocos e exercícios serão definidos posteriormente
                              </Typography>
                            </Box>
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
        </>
      )}
    </Container>
  );
};

export default Treinos;
