import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { exerciseService } from '../../services/exerciseService';
import { movementPatternService } from '../../services/movementPatternService';
import { supabase } from '../../lib/supabase';
import type { Exercise, MovementPattern, Video } from '../../types/database.types';
import { ExerciseWithVideoDialog } from '../../components/exercicios/ExerciseWithVideoDialog';
import PageHeader from '../../components/PageHeader';

/** Miniatura da mídia (vídeo ou imagem) para a listagem; carrega a URL assinada ao montar. */
function MediaThumbnail({ video, onClick }: { video: Video; onClick?: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase.storage
      .from('exercise-videos')
      .createSignedUrl(video.storage_path, 86400)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => { cancelled = true; };
  }, [video.storage_path]);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(video.storage_path);
  const boxSx = {
    width: 80,
    height: 56,
    minWidth: 80,
    minHeight: 56,
    borderRadius: 1,
    overflow: 'hidden',
    bgcolor: 'grey.900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    '&:hover': onClick ? { opacity: 0.9 } : {},
  };
  if (!url) {
    return <Box sx={boxSx}><CircularProgress size={20} /></Box>;
  }
  return (
    <Box component={onClick ? 'button' : 'div'} type={onClick ? 'button' : undefined} onClick={onClick} sx={{ ...boxSx, border: 0, p: 0 }}>
      {isImage ? (
        <img src={url} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <video src={url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
    </Box>
  );
}

/**
 * Tela "Exercícios com Vídeos".
 * Exibe apenas exercícios criados pelo usuário logado OU por usuários com role owner (query com join em users).
 * O vídeo do exercício é lido/escrito via `exercises.video_id` (join com `videos`).
 */
export default function ExerciciosComVideos() {
  const theme = useTheme();
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseScope, setExerciseScope] = useState<'mine' | 'app'>('mine');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'customize'>('create');

  const fetchExercisesForScope = useCallback(async (scope: 'mine' | 'app') => {
    if (!user?.id) return [];
    return scope === 'mine'
      ? await exerciseService.getExercisesCreatedByUser(user.id)
      : await exerciseService.getExercisesCreatedByOwnersExceptUser(user.id);
  }, [user?.id]);

  const loadExercises = useCallback(async () => {
    if (!user?.id) {
      setExercises([]);
      setLoadingExercises(false);
      return;
    }
    setLoadingExercises(true);
    try {
      const data = await fetchExercisesForScope(exerciseScope);
      setExercises(data);
    } catch (err: any) {
      console.error('Erro ao carregar exercícios:', err);
      setExercises([]);
    } finally {
      setLoadingExercises(false);
    }
  }, [user?.id, exerciseScope, fetchExercisesForScope]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const [movementPatterns, setMovementPatterns] = useState<MovementPattern[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorSeverity, setErrorSeverity] = useState<'error' | 'warning'>('error');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Dialog: criar/editar exercício com vídeo
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formEditingExercise, setFormEditingExercise] = useState<Exercise | null>(null);

  // Dialog: visualizar vídeo
  const [viewVideo, setViewVideo] = useState<Video | null>(null);
  const [viewVideoExerciseName, setViewVideoExerciseName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    let isMounted = true;
    movementPatternService.getAllMovementPatterns().then((data) => {
      if (isMounted) setMovementPatterns(data);
    }).catch(() => {}).finally(() => { if (isMounted) setLoadingPatterns(false); });
    return () => { isMounted = false; };
  }, []);

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

  const handleViewVideo = async (video: Video, exerciseName?: string) => {
    setViewVideo(video);
    setViewVideoExerciseName(exerciseName ?? null);
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
      setErrorSeverity('error');
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewVideo(null);
    setViewVideoExerciseName(null);
    setVideoUrl(null);
  };

  const handleFormSuccess = useCallback(() => {
    (async () => {
      if (formMode === 'customize' && user?.id) {
        // Após personalizar, trocar para "Meus exercícios" e recarregar a lista
        const mine = await fetchExercisesForScope('mine');
        setExerciseScope('mine');
        setExercises(mine);
        setSuccessMessage('Exercício personalizado criado em "Meus exercícios"!');
      } else {
        loadExercises();
        setSuccessMessage(formEditingExercise ? 'Exercício atualizado com sucesso!' : 'Exercício criado com sucesso!');
      }
    })();
    setShowSuccess(true);
    setFormDialogOpen(false);
    setFormEditingExercise(null);
    setFormMode('create');
  }, [formEditingExercise, loadExercises, formMode, user?.id, fetchExercisesForScope]);

  const handleNewExercise = () => {
    setFormMode('create');
    setFormEditingExercise(null);
    setFormDialogOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setFormMode('edit');
    setFormEditingExercise(exercise);
    setFormDialogOpen(true);
  };

  const handleCustomizeExercise = (exercise: Exercise) => {
    setFormMode('customize');
    setFormEditingExercise(exercise);
    setFormDialogOpen(true);
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!confirm(`Excluir o exercício "${exercise.name}"?`)) return;
    try {
      await exerciseService.deleteExercise(exercise.id);
      await loadExercises();
      setSuccessMessage(`Exercício "${exercise.name}" excluído.`);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir exercício.');
      setErrorSeverity('error');
    }
  };

  const isLoading = loadingExercises || loadingPatterns;

  if (isLoading && exercises.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <PageHeader
        title="Exercícios"
        subtitle="Crie e edite exercícios e adicione mídia (vídeo ou imagem)"
      />

      <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup
          exclusive
          value={exerciseScope}
          onChange={(_, v) => {
            if (!v) return;
            setExerciseScope(v);
          }}
          size="small"
          aria-label="Filtro de exercícios"
        >
          <ToggleButton value="mine" aria-label="Meus exercícios">
            Meus exercícios
          </ToggleButton>
          <ToggleButton value="app" aria-label="Exercícios do app">
            Exercícios do app
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mt: 4, mb: 2 }}>
        <TextField
          size="small"
          label="Buscar exercícios"
          placeholder="Nome, padrão ou tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewExercise}
          sx={{ flexShrink: 0 }}
        >
          Novo exercício
        </Button>
      </Stack>

      {error && (
        <Alert severity={errorSeverity} sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack
        spacing={2}
        direction="column"
        sx={{ width: '100%' }}
      >
        {exercisesFiltered.length === 0 ? (
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchTerm
                  ? 'Nenhum exercício encontrado com o filtro.'
                  : exerciseScope === 'mine'
                    ? 'Você ainda não tem exercícios.'
                    : 'Nenhum exercício do app disponível.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          exercisesFiltered.map((exercise) => {
            const firstVideo = (exercise.video ?? null) as Video | null;
            return (
              <Card key={exercise.id} sx={{ overflow: 'hidden', width: '100%' }}>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} flex={1} minWidth={0} alignItems="center">
                      <Box minWidth={0} flex={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {exercise.name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
                      {firstVideo?.storage_path && (
                        <MediaThumbnail
                          video={firstVideo}
                          onClick={() => handleViewVideo(firstVideo, exercise.name)}
                        />
                      )}
                      {exerciseScope === 'mine' ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditExercise(exercise)}
                          >
                            Editar
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteExercise(exercise)}
                            aria-label="Excluir exercício"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCustomizeExercise(exercise)}
                        >
                          Personalizar
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

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
          <Typography variant="h6">{viewVideoExerciseName ?? viewVideo?.title}</Typography>
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

      <ExerciseWithVideoDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
        mode={formMode}
        editingExercise={formEditingExercise}
        movementPatterns={movementPatterns}
        linkedVideo={formEditingExercise?.video ?? null}
      />

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
