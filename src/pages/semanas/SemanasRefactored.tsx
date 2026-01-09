import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';

// Componentes, dados e serviços
import { trainingService } from '../../services/trainingService';
import { adaptarSemanasParaVisualizacao, type SemanaComTreinos } from '../../utils/semanaAdapter';
import { SemanaRow } from '../../components/semanas/SemanaRow';
import { SemanaCard } from '../../components/semanas/SemanaCard';

const SemanasRefactored = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [semanas, setSemanas] = useState<SemanaComTreinos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Buscar dados do banco
  useEffect(() => {
    let isMounted = true;

    const loadSemanas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [SemanasRefactored] Carregando semanas do banco...');
        const weeksWithTrainings = await trainingService.getWeeksWithTrainings();
        
        if (!isMounted) return;

        const semanasAdaptadas = adaptarSemanasParaVisualizacao(weeksWithTrainings);
        setSemanas(semanasAdaptadas);
        
        console.log('✅ [SemanasRefactored] Carregadas', semanasAdaptadas.length, 'semanas');
      } catch (err) {
        if (!isMounted) return;
        
        console.error('❌ [SemanasRefactored] Erro ao carregar semanas:', err);
        setError('Erro ao carregar semanas. Tente novamente.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSemanas();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtros
  const filteredSemanas = semanas.filter((semana) => {
    const matchesSearch = 
      semana.focoSemana.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semana.numeroSemana.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || semana.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Semanas de Treino
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualize e gerencie os treinos de cada semana
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            placeholder="Buscar por semana ou foco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativa</MenuItem>
              <MenuItem value="draft">Rascunho</MenuItem>
              <MenuItem value="completed">Concluída</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando semanas...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Conteúdo - Desktop (Tabela) */}
      {!loading && !error && (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Semana
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Foco
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Período
                  </Typography>
                </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSemanas.map((semana) => (
                    <SemanaRow key={semana.id} semana={semana} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Conteúdo - Mobile (Cards) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <Stack 
              spacing={2}
              sx={{ 
                width: '100%',
                flexDirection: 'column'
              }}
            >
              {filteredSemanas.map((semana) => (
                <SemanaCard key={semana.id} semana={semana} />
              ))}
            </Stack>
          </Box>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSemanas.length === 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma semana encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {semanas.length === 0 
              ? 'Não há semanas cadastradas ainda.' 
              : 'Tente ajustar os filtros de busca.'
            }
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SemanasRefactored;
