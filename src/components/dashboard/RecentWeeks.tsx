import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { trainingService } from '../../services/trainingService';
import paths from '../../routes/paths';

const RecentWeeks = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<any[]>([]);

  useEffect(() => {
    loadRecentWeeks();
  }, []);

  const loadRecentWeeks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as semanas
      const allWeeks = await trainingService.getWeeksWithTrainings();
      
      // Ordenar por data de início (mais recente primeiro) e pegar as 5 primeiras
      const sortedWeeks = allWeeks
        .sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)))
        .slice(0, 5);
      
      setWeeks(sortedWeeks);
    } catch (err) {
      console.error('Erro ao carregar semanas recentes:', err);
      setError('Erro ao carregar semanas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWeek = (weekId: string) => {
    navigate(paths.semanas);
  };

  const handleEditWeek = (weekId: string) => {
    // Navegar para edição da semana (quando implementado)
    navigate(paths.semanas);
  };

  const handleCreateWeek = () => {
    // Navegar para criação de semana (quando implementado)
    navigate(paths.semanas);
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
              Semanas Recentes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Últimas 5 semanas de treino
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateWeek}
            size="small"
          >
            Nova Semana
          </Button>
        </Stack>

        {/* Table */}
        {weeks.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 6,
              bgcolor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma semana cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Crie sua primeira semana de treinos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWeek}
            >
              Criar Semana
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      Nome
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      Período
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight="600">
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight="600">
                      Treinos
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="600">
                      Ações
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeks.map((week) => (
                  <TableRow
                    key={week.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {/* Nome */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {week.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {week.week_focus?.name || 'Sem foco'}
                      </Typography>
                    </TableCell>

                    {/* Período */}
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(week.start_date).format('DD/MM')} - {dayjs(week.end_date).format('DD/MM/YY')}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(week.status)}
                        color={getStatusColor(week.status)}
                        size="small"
                        sx={{ minWidth: 80 }}
                      />
                    </TableCell>

                    {/* Nº de Treinos */}
                    <TableCell align="center">
                      <Chip
                        label={week.trainings?.length || 0}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 40 }}
                      />
                    </TableCell>

                    {/* Ações */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleViewWeek(week.id)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEditWeek(week.id)}
                            color="default"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentWeeks;
