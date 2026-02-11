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
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import VideoUploadDialog from '../../components/videos/VideoUploadDialog';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { videoService } from '../../services/videoService';
import type { Video, VideoFilters } from '../../types/database.types';

const VideoLibrary = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, loading: authLoading, isAdmin } = useAuth();
  const canSelectSource = !authLoading && (isAdmin || user?.role === 'admin');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Dialog de upload
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Dialog de edição
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    level: Video['level'];
    plane: Video['plane'];
    type: Video['type'];
    genre: Video['genre'];
    source: Video['source'];
  }>({
    title: '',
    description: '',
    level: 'beginner',
    plane: 'frontal',
    type: 'demo',
    genre: 'strength',
    source: 'personal',
  });
  const [editLoading, setEditLoading] = useState(false);

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
    setLoadingVideos(true);
    setError(null);
    try {
      const data = await videoService.getVideos(filters);
      setVideos(data);
    } catch (err: any) {
      console.error('Erro ao carregar vídeos:', err);
      setError(err.message || 'Erro ao carregar vídeos');
    } finally {
      setLoadingVideos(false);
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

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditFormData({
      title: video.title,
      description: video.description || '',
      level: video.level,
      plane: video.plane,
      type: video.type,
      genre: video.genre,
      source: video.source,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;

    setEditLoading(true);
    try {
      const updates: any = {
        title: editFormData.title,
        description: editFormData.description || undefined,
        level: editFormData.level,
        plane: editFormData.plane,
        type: editFormData.type,
        genre: editFormData.genre,
      };

      if (canSelectSource) {
        updates.source = editFormData.source;
      }

      await videoService.updateVideo(editingVideo.id, updates);

      loadVideos();
      setEditDialogOpen(false);
      setEditingVideo(null);
    } catch (err: any) {
      console.error('Erro ao atualizar vídeo:', err);
      alert('Erro ao atualizar vídeo: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingVideo(null);
  };

  const handleViewVideo = async (video: Video) => {
    setSelectedVideo(video);
    setViewDialogOpen(true);
    setLoadingUrl(true);
    setVideoUrl(null);

    try {
      // Gerar URL assinada da mídia
      const { data, error } = await supabase.storage
        .from('exercise-videos')
        .createSignedUrl(video.storage_path, 86400); // 24 horas

      if (error) throw error;
      setVideoUrl(data.signedUrl);
    } catch (err) {
      console.error('Erro ao carregar mídia:', err);
      alert('Erro ao carregar mídia');
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
      field: 'file_size_kb',
      headerName: 'Tamanho',
      width: 90,
      renderCell: (params: GridRenderCellParams<Video>) => {
        const sizeKB = params.row.file_size_kb;

        if (!sizeKB || sizeKB === 0) return '-';

        if (sizeKB < 1024) {
          return `${sizeKB} KB`;
        } else {
          const sizeMB = sizeKB / 1024;
          return `${sizeMB.toFixed(1)} MB`;
        }
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
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            disabled={params.row.source === 'platform'}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>

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
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Vídeos
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.platformCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plataforma
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.personalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pessoais
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
          <Stack direction="row" spacing={3}>
            <Button
              size="small"
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
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={8}>
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
            <Grid item xs={12} md={4}>
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

            {/* Plano de visão */}
            {/* <Grid item xs={12} sm={6} md={2}>
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
            </Grid> */}

            {/* <Grid item xs={12} sm={6} md={2}>
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
            </Grid> */}

            {/* Filtro por origem */}
            {/* <Grid item xs={12} sm={6} md={2}>
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
            </Grid> */}

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
          loading={loadingVideos}
          autoHeight
          disableRowSelectionOnClick
          density={isMobile ? 'compact' : 'standard'}
          columnVisibilityModel={
            isMobile
              ? {
                plane: false,
                type: false,
                file_size_kb: false,
              }
              : {
                plane: true,
                type: true,
                file_size_kb: true,
              }
          }
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
            ...(isMobile
              ? {
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                },
                '& .MuiDataGrid-cell': {
                  py: 1,
                },
              }
              : null),
          }}
        />
      </Card>

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="video-dialog-title"
        aria-describedby="video-dialog-content"
        disableEnforceFocus
      >
        <DialogTitle id="video-dialog-title">
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
        <DialogContent id="video-dialog-content">
          {loadingUrl && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          )}
          {!loadingUrl && videoUrl && (
            <Box>
              {(() => {
                // Detectar se é imagem ou vídeo pelo storage_path
                const isImage = selectedVideo?.storage_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

                if (isImage) {
                  return (
                    <img
                      src={videoUrl}
                      alt={selectedVideo?.title}
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        borderRadius: '8px',
                        objectFit: 'contain',
                      }}
                    />
                  );
                } else {
                  return (
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
                  );
                }
              })()}
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
              Não foi possível carregar a mídia
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

      {/* Dialog de Edição */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-content"
        disableEnforceFocus
      >
        <DialogTitle id="edit-dialog-title">Editar Vídeo</DialogTitle>
        <DialogContent id="edit-dialog-content">
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={editLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={editLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={editLoading}>
                <InputLabel>Nível</InputLabel>
                <Select
                  value={editFormData.level}
                  label="Nível"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, level: e.target.value as any }))}
                >
                  <MenuItem value="beginner">Iniciante</MenuItem>
                  <MenuItem value="intermediate">Intermediário</MenuItem>
                  <MenuItem value="advanced">Avançado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={editLoading}>
                <InputLabel>Plano</InputLabel>
                <Select
                  value={editFormData.plane}
                  label="Plano"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, plane: e.target.value as any }))}
                >
                  <MenuItem value="frontal">Frontal</MenuItem>
                  <MenuItem value="lateral">Lateral</MenuItem>
                  <MenuItem value="dorsal">Dorsal</MenuItem>
                  <MenuItem value="detail">Detalhe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={editLoading}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={editFormData.type}
                  label="Tipo"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="demo">Demonstração</MenuItem>
                  <MenuItem value="education">Educativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={editLoading}>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={editFormData.genre}
                  label="Gênero"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, genre: e.target.value as any }))}
                >
                  <MenuItem value="strength">Força</MenuItem>
                  <MenuItem value="cardio">Cardio</MenuItem>
                  <MenuItem value="mobility">Mobilidade</MenuItem>
                  <MenuItem value="core">Core</MenuItem>
                  <MenuItem value="balance">Equilíbrio</MenuItem>
                  <MenuItem value="flexibility">Flexibilidade</MenuItem>
                  <MenuItem value="power">Potência</MenuItem>
                  <MenuItem value="endurance">Resistência</MenuItem>
                  <MenuItem value="other">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {canSelectSource && (
              <Grid item xs={12}>
                <FormControl fullWidth disabled={editLoading}>
                  <InputLabel>Origem</InputLabel>
                  <Select
                    value={editFormData.source}
                    label="Origem"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, source: e.target.value as any }))}
                  >
                    <MenuItem value="personal">Pessoal</MenuItem>
                    <MenuItem value="platform">Plataforma</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} disabled={editLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={editLoading || !editFormData.title.trim()}
          >
            {editLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoLibrary;
