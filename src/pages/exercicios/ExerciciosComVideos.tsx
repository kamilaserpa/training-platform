import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PlayCircleOutline as PlayIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetchExercises } from '../../hooks/useFetchExercises';
import { exerciseVideoService } from '../../services/exerciseVideoService';
import { supabase } from '../../lib/supabase';
import type { Exercise, ExerciseVideo, Video } from '../../types/database.types';
import { VideoSelector } from '../../components/treinos/VideoSelector';
import PageHeader from '../../components/PageHeader';

export default function ExerciciosComVideos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: exercisesFromCache, isLoading: loadingExercises } = useFetchExercises();
  const exercises = exercisesFromCache || [];

  const [linkedByExercise, setLinkedByExercise] = useState<Record<string, ExerciseVideo[]>>({});
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal: adicionar vídeo ao exercício
  const [addVideoExercise, setAddVideoExercise] = useState<Exercise | null>(null);
  const [linking, setLinking] = useState(false);

  // Dialog: visualizar vídeo
  const [viewVideo, setViewVideo] = useState<Video | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoadingLinks(true);
    try {
      const grouped = await exerciseVideoService.getAllGroupedByExerciseId();
      setLinkedByExercise(grouped);
    } catch (err: any) {
      console.error('Erro ao carregar vínculos:', err);
      setError(err.message || 'Erro ao carregar vínculos exercício-vídeo.');
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const exercisesFiltered = useMemo(() => {
    if (!searchTerm.trim()) return exercises;
    const term = searchTerm.toLowerCase();
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(term) ||
        ex.movement_pattern?.name?.toLowerCase().includes(term) ||
        ex.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }, [exercises, searchTerm]);

  const handleAddVideoClick = (exercise: Exercise) => {
    setAddVideoExercise(exercise);
  };

  const handleAddVideoSelect = async (video: Video) => {
    if (!addVideoExercise) return;
    setLinking(true);
    try {
      await exerciseVideoService.link(addVideoExercise.id, video.id);
      await loadLinks();
      setAddVideoExercise(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao vincular vídeo.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (ev: ExerciseVideo) => {
    if (!confirm(`Remover o vídeo "${(ev.video as Video)?.title}" deste exercício?`)) return;
    try {
      await exerciseVideoService.unlinkById(ev.id);
      await loadLinks();
    } catch (err: any) {
      setError(err.message || 'Erro ao desvincular vídeo.');
    }
  };

  const handleViewVideo = async (video: Video) => {
    setViewVideo(video);
    setVideoUrl(null);
    setLoadingUrl(true);
    try {
      const { data, error } = await supabase.storage
        .from('exercise-videos')
        .createSignedUrl(video.storage_path, 86400);
      if (error) throw error;
      setVideoUrl(data.signedUrl);
    } catch (err) {
      console.error('Erro ao carregar mídia:', err);
      setError('Não foi possível carregar o vídeo.');
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewVideo(null);
    setVideoUrl(null);
  };

  const isLoading = loadingExercises || loadingLinks;

  if (isLoading && exercises.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Exercícios com Vídeos"
        subtitle="Vincule vídeos aos exercícios e visualize-os aqui"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Buscar exercícios"
          placeholder="Nome, padrão ou tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: { sm: 320 } }}
        />
      </Stack>

      <Stack spacing={2}>
        {exercisesFiltered.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchTerm ? 'Nenhum exercício encontrado com o filtro.' : 'Nenhum exercício cadastrado.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          exercisesFiltered.map((exercise) => {
            const links = linkedByExercise[exercise.id] || [];
            return (
              <Card key={exercise.id} sx={{ overflow: 'hidden' }}>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    justifyContent="space-between"
                  >
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {exercise.name}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {exercise.movement_pattern?.name && (
                          <Chip label={exercise.movement_pattern.name} size="small" variant="outlined" />
                        )}
                        {exercise.tags?.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddVideoClick(exercise)}
                    >
                      {isMobile ? 'Vídeo' : 'Adicionar vídeo'}
                    </Button>
                  </Stack>

                  {/* Lista de vídeos vinculados */}
                  {links.length > 0 && (
                    <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                        Vídeos vinculados ({links.length})
                      </Typography>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {links.map((ev) => {
                          const video = ev.video as Video | undefined;
                          if (!video) return null;
                          return (
                            <Box
                              key={ev.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexWrap: 'wrap',
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                              }}
                            >
                              <VideoLibraryIcon fontSize="small" color="action" />
                              <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 140, sm: 200 } }}>
                                {video.title}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleViewVideo(video)}
                                aria-label="Assistir vídeo"
                              >
                                <PlayIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleUnlink(ev)}
                                aria-label="Remover vínculo"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {/* Modal: selecionar vídeo para vincular */}
      <Dialog
        open={!!addVideoExercise}
        onClose={() => !linking && setAddVideoExercise(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '60vh', maxHeight: '90vh' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Adicionar vídeo ao exercício
              {addVideoExercise && (
                <Chip label={addVideoExercise.name} size="small" sx={{ ml: 1 }} color="primary" />
              )}
            </Typography>
            <IconButton
              edge="end"
              onClick={() => !linking && setAddVideoExercise(null)}
              aria-label="fechar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {addVideoExercise && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Clique em um vídeo abaixo para vinculá-lo ao exercício. O vínculo é salvo na hora.
              </Typography>
              <VideoSelector
                exerciseId={addVideoExercise.id}
                onSelect={handleAddVideoSelect}
                selectedVideoId={undefined}
              />
            </>
          )}
          {linking && (
            <Box position="absolute" top={0} left={0} right={0} bottom={0} bgcolor="rgba(255,255,255,0.7)" display="flex" alignItems="center" justifyContent="center" zIndex={10}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: visualizar vídeo */}
      <Dialog
        open={!!viewVideo}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        aria-labelledby="view-video-dialog-title"
      >
        <DialogTitle id="view-video-dialog-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{viewVideo?.title}</Typography>
            <IconButton edge="end" onClick={handleCloseViewDialog} aria-label="fechar">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingUrl && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress />
            </Box>
          )}
          {!loadingUrl && videoUrl && viewVideo && (
            <Box>
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(viewVideo.storage_path) ? (
                <img
                  src={videoUrl}
                  alt={viewVideo.title}
                  style={{ width: '100%', maxHeight: '70vh', borderRadius: 8, objectFit: 'contain' }}
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{ width: '100%', maxHeight: '70vh', borderRadius: 8 }}
                />
              )}
              {viewVideo.description && (
                <Typography variant="body2" color="text.secondary" mt={2}>
                  {viewVideo.description}
                </Typography>
              )}
            </Box>
          )}
          {!loadingUrl && !videoUrl && viewVideo && (
            <Alert severity="error">Não foi possível carregar a mídia.</Alert>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
