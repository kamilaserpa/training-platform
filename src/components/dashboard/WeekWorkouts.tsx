import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { trainingService } from '../../services/trainingService';
import paths from '../../routes/paths';

dayjs.extend(isBetween);

const WeekWorkouts = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    loadWeekWorkouts();
  }, []);

  const loadWeekWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as semanas com treinos
      const weeks = await trainingService.getWeeksWithTrainings();
      
      // Encontrar a semana atual
      const today = dayjs();
      const currentWeek = weeks.find(week => {
        const start = dayjs(week.start_date);
        const end = dayjs(week.end_date);
        return today.isBetween(start, end, 'day', '[]');
      });

      if (currentWeek && currentWeek.trainings) {
        // Ordenar treinos por data
        const sortedWorkouts = currentWeek.trainings.sort((a, b) => 
          dayjs(a.scheduled_date).diff(dayjs(b.scheduled_date))
        );
        setWorkouts(sortedWorkouts);
      }
    } catch (err) {
      console.error('Erro ao carregar treinos da semana:', err);
      setError('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorkout = (workoutId: string) => {
    navigate(`/pages/treinos/${workoutId}/editar`);
  };

  const handleAddWorkout = () => {
    navigate(paths.treinoNovo);
  };

  const getDayName = (date: string) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayjs(date).day()];
  };

  const getTotalExercises = (workout: any) => {
    if (!workout.training_blocks) return 0;
    return workout.training_blocks.reduce((total: number, block: any) => {
      return total + (block.exercise_prescriptions?.length || 0);
    }, 0);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('workouts-scroll-container');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Treinos desta Semana
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {workouts.length} {workouts.length === 1 ? 'treino agendado' : 'treinos agendados'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddWorkout}
            size="small"
          >
            Novo Treino
          </Button>
        </Stack>

        {/* Workouts List */}
        {workouts.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 6,
              bgcolor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum treino esta semana
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Adicione treinos para organizar sua programação
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddWorkout}
            >
              Adicionar Treino
            </Button>
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {/* Scroll Buttons */}
            {!isMobile && workouts.length > 3 && (
              <>
                <IconButton
                  onClick={() => scroll('left')}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <IconButton
                  onClick={() => scroll('right')}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </>
            )}

            {/* Scrollable Container */}
            <Box
              id="workouts-scroll-container"
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              {workouts.map((workout) => (
                <Card
                  key={workout.id}
                  sx={{
                    minWidth: isMobile ? 280 : 300,
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 3,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <CardContent>
                    {/* Day Badge */}
                    <Chip
                      label={getDayName(workout.scheduled_date)}
                      size="small"
                      color="primary"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />

                    {/* Workout Name */}
                    <Typography variant="h6" fontWeight="600" mb={1} noWrap>
                      {workout.name}
                    </Typography>

                    {/* Date */}
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {dayjs(workout.scheduled_date).format('DD/MM/YYYY')}
                    </Typography>

                    {/* Stats */}
                    <Stack spacing={1} mb={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Blocos:
                        </Typography>
                        <Typography variant="caption" fontWeight="600">
                          {workout.training_blocks?.length || 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Exercícios:
                        </Typography>
                        <Typography variant="caption" fontWeight="600">
                          {getTotalExercises(workout)}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Action Button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewWorkout(workout.id)}
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekWorkouts;
