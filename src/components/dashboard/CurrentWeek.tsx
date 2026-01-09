import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { trainingService } from '../../services/trainingService';

dayjs.extend(isBetween);

interface CurrentWeekProps {
  // Pode receber props opcionais no futuro
}

const CurrentWeek = (props: CurrentWeekProps) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<any>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentWeek();
  }, []);

  const loadCurrentWeek = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as semanas
      const weeks = await trainingService.getWeeksWithTrainings();
      
      // Encontrar a semana atual (baseado na data)
      const today = dayjs();
      const currentWeek = weeks.find(week => {
        const start = dayjs(week.start_date);
        const end = dayjs(week.end_date);
        return today.isBetween(start, end, 'day', '[]');
      });

      if (currentWeek) {
        setWeekData(currentWeek);
        
        // Contar treinos por dia
        const trainings = currentWeek.trainings || [];
        setWorkoutsThisWeek(trainings);
      } else {
        setError('Nenhuma semana ativa encontrada');
      }
    } catch (err) {
      console.error('Erro ao carregar semana atual:', err);
      setError('Erro ao carregar dados da semana');
    } finally {
      setLoading(false);
    }
  };

  const getDayStatus = (dayName: string) => {
    const dayMap: { [key: string]: number } = {
      'segunda': 1,
      'terca': 2,
      'quarta': 3,
      'quinta': 4,
      'sexta': 5,
    };

    const targetDay = dayMap[dayName.toLowerCase()];
    
    const hasWorkout = workoutsThisWeek.some(training => {
      const trainingDay = dayjs(training.scheduled_date).day();
      return trainingDay === targetDay;
    });

    return hasWorkout;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'draft':
        return 'Rascunho';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  };

  const handleViewWeek = () => {
    if (weekData) {
      navigate('/pages/semanas');
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
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
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="info">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!weekData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="info">
            Nenhuma semana ativa no momento
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const days = [
    { key: 'Segunda', label: 'SEG' },
    { key: 'Terça', label: 'TER' },
    { key: 'Quarta', label: 'QUA' },
    { key: 'Quinta', label: 'QUI' },
    { key: 'Sexta', label: 'SEX' },
  ];

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              SEMANA ATUAL
            </Typography>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              {weekData.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {weekData.week_focus?.name || 'Sem foco definido'}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(weekData.status)}
            color={getStatusColor(weekData.status)}
            sx={{ 
              fontWeight: 600,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />

        {/* Stats Grid */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <CalendarIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Período
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="600">
                {dayjs(weekData.start_date).format('DD/MM')} - {dayjs(weekData.end_date).format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <FitnessCenterIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Treinos
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight="600">
                {workoutsThisWeek.length} cadastrados
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Days of Week */}
        <Box mb={3}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, display: 'block' }}>
            DIAS DA SEMANA
          </Typography>
          <Stack direction="row" spacing={1}>
            {days.map((day) => {
              const hasWorkout = getDayStatus(day.key);
              return (
                <Chip
                  key={day.key}
                  icon={hasWorkout ? <CheckCircleIcon /> : <RemoveCircleIcon />}
                  label={day.label}
                  size="small"
                  sx={{
                    bgcolor: hasWorkout ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: hasWorkout ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<VisibilityIcon />}
          onClick={handleViewWeek}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          Ver Semana Completa
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrentWeek;
