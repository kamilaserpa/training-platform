import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    PlayCircleOutline as PlayIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import VideoUploadDialog from '../../components/videos/VideoUploadDialog';
import { supabase } from '../../lib/supabase';
import { videoService } from '../../services/videoService';
import type { Video, VideoFilters } from '../../types/database.types';

const VideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Dialog de upload
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Dialog de visualização
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<VideoFilters>({
    search: '',
    level: undefined,
    plane: undefined,
    type: undefined,
    genre: undefined,
    source: undefined,
  });

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalCount: 0,
    platformCount: 0,
    personalCount: 0,
    totalSizeMB: 0,
  });

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videoService.getVideos(filters);
      setVideos(data);
    } catch (err: any) {
      console.error('Erro ao carregar vídeos:', err);
      setError(err.message || 'Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await videoService.getVideoStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    loadVideos();
    loadStats();
  }, []);

  const handleFilterChange = (key: keyof VideoFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    loadVideos();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      level: undefined,
      plane: undefined,
      type: undefined,
      genre: undefined,
      source: undefined,
    });
    setTimeout(() => loadVideos(), 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este vídeo?')) return;

    try {
      await videoService.deleteVideo(id);
      loadVideos();
      loadStats();
    } catch (err: any) {
      alert('Erro ao excluir vídeo: ' + err.message);
    }
  };

  const handleViewVideo = async (video: Video) => {
    setSelectedVideo(video);
    setViewDialogOpen(true);
    setLoadingUrl(true);
    setVideoUrl(null);

    try {
      // Gerar URL assinada do vídeo
      const { data, error } = await supabase.storage
        .from('exercise-videos')
        .createSignedUrl(video.storage_path, 86400); // 24 horas

      if (error) throw error;
      setVideoUrl(data.signedUrl);
    } catch (err) {
      console.error('Erro ao carregar vídeo:', err);
      alert('Erro ao carregar vídeo');
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedVideo(null);
    setVideoUrl(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Video>) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.title}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'level',
      headerName: 'Nível',
      width: 120,
      renderCell: (params: GridRenderCellParams<Video>) => {
        const levelColors: Record<string, 'success' | 'warning' | 'error'> = {
          beginner: 'success',
          intermediate: 'warning',
          advanced: 'error',
        };
        const levelLabels: Record<string, string> = {
          beginner: 'Iniciante',
          intermediate: 'Intermediário',
          advanced: 'Avançado',
        };
        return (
          <Chip
            label={levelLabels[params.row.level || 'beginner']}
            color={levelColors[params.row.level || 'beginner']}
            size="small"
          />
        );
      },
    },
    {
      field: 'plane',
      headerName: 'Plano',
      width: 100,
      renderCell: (params: GridRenderCellParams<Video>) => {
        const planeLabels: Record<string, string> = {
          frontal: 'Frontal',
          lateral: 'Lateral',
          dorsal: 'Dorsal',
          detail: 'Detalhe',
        };
        return planeLabels[params.row.plane || 'frontal'];
      },
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 110,
      renderCell: (params: GridRenderCellParams<Video>) => {
        const typeLabels: Record<string, string> = {
          demo: 'Demonstração',
          education: 'Educativo',
        };
        return (
          <Chip
            label={typeLabels[params.row.type || 'demo']}
            variant="outlined"
            size="small"
          />
        );
      },
    },
    {
      field: 'source',
      headerName: 'Origem',
      width: 110,
      renderCell: (params: GridRenderCellParams<Video>) => {
        const isplatform = params.row.source === 'platform';
        return (
          <Chip
            label={isplatform ? 'Plataforma' : 'Pessoal'}
            color={isplatform ? 'primary' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'duration_seconds',
      headerName: 'Duração',
      width: 90,
      valueGetter: (params: any) => {
        if (!params?.row) return '-';
        const seconds = params.row.duration_seconds;
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      },
    },
    {
      field: 'created_at',
      headerName: 'Criado',
      width: 120,
      valueGetter: (params: any) => {
        if (!params?.row?.created_at) return '-';
        return formatDistanceToNow(new Date(params.row.created_at), {
          addSuffix: true,
          locale: ptBR,
        });
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Video>) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              onClick={() => handleViewVideo(params.row)}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => {/* TODO: Abrir dialog de edição */}}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
              disabled={params.row.source === 'platform'}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Biblioteca de Vídeos"
        subtitle="Gerencie vídeos de demonstração de exercícios"
      />

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Vídeos
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.platformCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plataforma
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.personalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pessoais
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.totalSizeMB.toFixed(1)} MB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Espaço Usado
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            <FilterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Filtros
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
            <Button size="small" onClick={handleClearFilters}>
              Limpar
            </Button>
          </Stack>
        </Stack>

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Buscar"
                placeholder="Título ou descrição..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Nível"
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="beginner">Iniciante</MenuItem>
                <MenuItem value="intermediate">Intermediário</MenuItem>
                <MenuItem value="advanced">Avançado</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Plano"
                value={filters.plane || ''}
                onChange={(e) => handleFilterChange('plane', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="frontal">Frontal</MenuItem>
                <MenuItem value="lateral">Lateral</MenuItem>
                <MenuItem value="dorsal">Dorsal</MenuItem>
                <MenuItem value="detail">Detalhe</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Tipo"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="demo">Demonstração</MenuItem>
                <MenuItem value="education">Educativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Origem"
                value={filters.source || ''}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="platform">Plataforma</MenuItem>
                <MenuItem value="personal">Pessoal</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={12} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </Button>
            </Grid>
          </Grid>
        )}
      </Card>

      {/* Ações */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Novo Vídeo
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            loadVideos();
            loadStats();
          }}
        >
          Atualizar
        </Button>
      </Stack>

      {/* Tabela */}
      <Card>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <DataGrid
          rows={videos}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Card>

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {selectedVideo?.title}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseViewDialog}
              aria-label="fechar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingUrl && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          )}
          {!loadingUrl && videoUrl && (
            <Box>
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  borderRadius: '8px',
                }}
              />
              {selectedVideo?.description && (
                <Typography variant="body2" color="text.secondary" mt={2}>
                  {selectedVideo.description}
                </Typography>
              )}
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Nível: <strong>{selectedVideo?.level}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Plano: <strong>{selectedVideo?.plane}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tipo: <strong>{selectedVideo?.type}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          {!loadingUrl && !videoUrl && (
            <Alert severity="error">
              Não foi possível carregar o vídeo
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Upload */}
      <VideoUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => {
          loadVideos();
          loadStats();
        }}
      />
    </Box>
  );
};

export default VideoLibrary;
