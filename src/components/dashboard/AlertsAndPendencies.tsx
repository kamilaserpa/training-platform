import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert as MuiAlert,
  Chip,
  Divider,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarToday as CalendarIcon,
  AddCircleOutline as AddIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { TrainingBlock } from '../../types/database.types';
import isBetween from 'dayjs/plugin/isBetween';
import { trainingService } from '../../services/trainingService';
import paths from '../../routes/paths';

dayjs.extend(isBetween);

interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'week_no_workouts' | 'workout_overlap' | 'workout_incomplete' | 'week_no_focus';
  ctaLabel: string;
  ctaAction: () => void;
  metadata?: any;
}

const AlertsAndPendencies = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE_ALERTS = 6;

  useEffect(() => {
    analyzeAndGenerateAlerts();
  }, []);

  const analyzeAndGenerateAlerts = async () => {
    try {
      setLoading(true);
      
      // Buscar dados necessários
      const weeks = await trainingService.getWeeksWithTrainings();
      
      const generatedAlerts: Alert[] = [];
      const today = dayjs();

      // =====================================
      // 1. Verificar semanas sem treinos
      // =====================================
      const currentAndFutureWeeks = weeks.filter(week => {
        const endDate = dayjs(week.end_date);
        return endDate.isAfter(today) || endDate.isSame(today, 'day');
      });

      currentAndFutureWeeks.forEach(week => {
        const workoutCount = week.trainings?.length || 0;
        
        if (workoutCount === 0) {
          const isCurrentWeek = today.isBetween(
            dayjs(week.start_date),
            dayjs(week.end_date),
            'day',
            '[]'
          );

          generatedAlerts.push({
            id: `week-no-workouts-${week.id}`,
            message: `${week.name} ${isCurrentWeek ? '(atual)' : ''} está sem treinos cadastrados`,
            severity: isCurrentWeek ? 'critical' : 'warning',
            type: 'week_no_workouts',
            ctaLabel: 'Adicionar Treino',
            ctaAction: () => navigate(`${paths.treinoNovo}?semana=${week.id}`),
            metadata: { weekId: week.id, weekName: week.name },
          });
        }
      });

      // =====================================
      // 2. Verificar semanas sem foco definido
      // =====================================
      currentAndFutureWeeks.forEach(week => {
        if (!week.week_focus || !week.week_focus.name) {
          generatedAlerts.push({
            id: `week-no-focus-${week.id}`,
            message: `${week.name} está sem foco de treino definido`,
            severity: 'info',
            type: 'week_no_focus',
            ctaLabel: 'Definir Foco',
            ctaAction: () => navigate(paths.semanas),
            metadata: { weekId: week.id, weekName: week.name },
          });
        }
      });

      // =====================================
      // 3. Verificar treinos com sobreposição (mesmo dia)
      // =====================================
      const allTrainings = weeks.flatMap(week => week.trainings || []);
      const trainingsByDate: { [key: string]: any[] } = {};
      
      allTrainings.forEach(training => {
        const dateKey = training.scheduled_date;
        if (!trainingsByDate[dateKey]) {
          trainingsByDate[dateKey] = [];
        }
        trainingsByDate[dateKey].push(training);
      });

      Object.entries(trainingsByDate).forEach(([date, trainings]) => {
        if (trainings.length > 1) {
          const formattedDate = dayjs(date).format('DD/MM/YYYY');
          const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayjs(date).day()];
          
          generatedAlerts.push({
            id: `overlap-${date}`,
            message: `${trainings.length} treinos agendados para o mesmo dia (${dayName}, ${formattedDate})`,
            severity: 'warning',
            type: 'workout_overlap',
            ctaLabel: 'Ver Treinos',
            ctaAction: () => navigate(paths.treinos),
            metadata: { date, trainings },
          });
        }
      });

      // =====================================
      // 4. Verificar treinos incompletos (blocos sem exercícios)
      // =====================================
      allTrainings.forEach(training => {
        if (training.training_blocks) {
          let hasIncompleteBlocks = false;
          let incompleteBlocksCount = 0;

          training.training_blocks.forEach((block: TrainingBlock) => {
            // Ignorar bloco de condicionamento físico
            const isConditioningBlock = block.block_type === 'CONDICIONAMENTO_FISICO' || 
                                       block.name?.toLowerCase().includes('condicionamento');
            
            if (!isConditioningBlock) {
              const exerciseCount = block.exercise_prescriptions?.length || 0;
              if (exerciseCount === 0) {
                hasIncompleteBlocks = true;
                incompleteBlocksCount++;
              }
            }
          });

          if (hasIncompleteBlocks) {
            generatedAlerts.push({
              id: `incomplete-${training.id}`,
              message: `${training.name} tem ${incompleteBlocksCount} bloco(s) sem exercícios`,
              severity: 'warning',
              type: 'workout_incomplete',
              ctaLabel: 'Completar',
              ctaAction: () => navigate(`/pages/treinos/${training.id}/editar`),
              metadata: { trainingId: training.id, incompleteBlocks: incompleteBlocksCount },
            });
          }
        }
      });

      // Ordenar alertas por severidade (critical > warning > info)
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Erro ao analisar alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'info':
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error;
      case 'warning':
        return theme.palette.warning;
      case 'info':
        return theme.palette.info;
    }
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Atenção';
      case 'info':
        return 'Info';
    }
  };

  const visibleAlerts = showAll ? alerts : alerts.slice(0, MAX_VISIBLE_ALERTS);
  const hasMoreAlerts = alerts.length > MAX_VISIBLE_ALERTS;

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

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Alertas & Pendências
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {alerts.length === 0 
                ? 'Tudo em ordem!'
                : `${alerts.length} ${alerts.length === 1 ? 'item requer' : 'itens requerem'} atenção`
              }
            </Typography>
          </Box>
          
          {alerts.length > 0 && (
            <Chip
              label={alerts.length}
              color={
                alerts.some(a => a.severity === 'critical') ? 'error' :
                alerts.some(a => a.severity === 'warning') ? 'warning' : 
                'info'
              }
              sx={{ fontWeight: 700, fontSize: '1rem', minWidth: 45 }}
            />
          )}
        </Stack>

        {/* Empty State */}
        {alerts.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 6,
              bgcolor: 'success.lighter',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.dark" gutterBottom fontWeight="600">
              Nenhuma pendência no momento
            </Typography>
            <Typography variant="body2" color="success.dark">
              Tudo está em ordem! 🎉
            </Typography>
          </Box>
        ) : (
          <>
            {/* Alerts List */}
            <Stack spacing={2}>
              {visibleAlerts.map((alert, index) => (
                <Box key={alert.id}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${getSeverityColor(alert.severity).light}20`,
                      border: '1px solid',
                      borderColor: `${getSeverityColor(alert.severity).light}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${getSeverityColor(alert.severity).light}30`,
                        boxShadow: 2,
                      },
                    }}
                  >
                    {/* Icon & Severity */}
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: { sm: 150 } }}>
                      {getSeverityIcon(alert.severity)}
                      <Chip
                        label={getSeverityLabel(alert.severity)}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(alert.severity).main,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>

                    {/* Message */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="500">
                        {alert.message}
                      </Typography>
                    </Box>

                    {/* CTA Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={alert.ctaAction}
                      sx={{
                        borderColor: getSeverityColor(alert.severity).main,
                        color: getSeverityColor(alert.severity).main,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          borderColor: getSeverityColor(alert.severity).dark,
                          bgcolor: `${getSeverityColor(alert.severity).main}10`,
                        },
                      }}
                    >
                      {alert.ctaLabel}
                    </Button>
                  </Stack>
                  
                  {index < visibleAlerts.length - 1 && (
                    <Divider sx={{ mt: 2, opacity: 0.3 }} />
                  )}
                </Box>
              ))}
            </Stack>

            {/* Show More/Less Button */}
            {hasMoreAlerts && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowAll(!showAll)}
                  sx={{ fontWeight: 600 }}
                >
                  {showAll 
                    ? 'Ver menos' 
                    : `Ver todos (${alerts.length - MAX_VISIBLE_ALERTS} restantes)`
                  }
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsAndPendencies;
