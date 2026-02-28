import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  DeleteOutline as RemoveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { exerciseService } from '../../services/exerciseService';
import { videoService } from '../../services/videoService';
import type { CreateExerciseDTO, CreateVideoDTO, Exercise, MovementPattern, Video } from '../../types/database.types';

const PREDEFINED_TAGS = [
  'mobilidade', 'core', 'ativacao', 'forca', 'condicionamento',
  'articulacao', 'alongamento', 'estabilizacao', 'pliometrico', 'potencia',
  'cardio', 'hiit', 'resistencia', 'circuito', 'neural',
  'empurrar', 'puxar', 'squat', 'hinge', 'lunge', 'rotacao', 'isometria',
  'peito', 'costas', 'ombro', 'bracos', 'pernas', 'gluteo', 'panturrilha', 'abdomen',
  'baixa', 'media', 'alta', 'peso_livre', 'maquina', 'cabo', 'corporal', 'elastico',
];

/** Limite do Supabase Storage (padrão 50MB). Validar no cliente para dar feedback antes do upload. */
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Dimensão máxima (lado maior) para imagens após compressão; reduz tamanho e mantém qualidade. */
const MAX_IMAGE_DIMENSION = 1920;
/** Qualidade de compressão para JPEG/WebP (0–1). */
const IMAGE_QUALITY = 0.82;

/**
 * Comprime imagem no cliente via Canvas: redimensiona se passar do máximo e exporta com qualidade.
 * GIF animado não é comprimido (mantém animação). Retorna o arquivo original em caso de erro ou tipo não suportado.
 */
function compressImageFile(file: File): Promise<File> {
  const type = file.type;
  const isGif = type === 'image/gif';
  const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type);
  if (isGif || !supported) return Promise.resolve(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let width = w;
      let height = h;
      if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
        if (w >= h) {
          width = MAX_IMAGE_DIMENSION;
          height = Math.round((h * MAX_IMAGE_DIMENSION) / w);
        } else {
          height = MAX_IMAGE_DIMENSION;
          width = Math.round((w * MAX_IMAGE_DIMENSION) / h);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const keepPng = type === 'image/png';
      const outputType = keepPng ? 'image/png' : 'image/jpeg';
      const quality = keepPng ? undefined : IMAGE_QUALITY;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const ext = keepPng ? 'png' : 'jpg';
          const compressed = new File([blob], `${baseName}.${ext}`, { type: outputType });
          resolve(compressed);
        },
        outputType,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function getUserFriendlyErrorMessage(err: unknown): string {
  const obj = err && typeof err === 'object' ? (err as Record<string, unknown>) : null;
  const msg = obj?.message != null ? String(obj.message) : '';
  const code = obj?.code != null ? String(obj.code) : '';

  if (msg.includes('exceeded the maximum allowed size') || msg.includes('maximum allowed size')) {
    return `O arquivo é muito grande. O limite do servidor é ${MAX_FILE_SIZE_MB} MB. Use um vídeo ou imagem menor ou exporte em qualidade "web".`;
  }
  if (code === '23505' || msg.includes('duplicate key') || msg.includes('unique_exercise_per_user')) {
    return 'Já existe um exercício com este nome na sua lista. Use outro nome ou edite o existente.';
  }
  if (msg.includes('Tempo esgotado') || msg.includes('obtendo sessão') || msg.includes('Verifique sua conexão')) {
    return 'A conexão demorou muito. Verifique sua internet e tente novamente.';
  }
  if (msg.includes('not authenticated') || msg.includes('Usuário não autenticado')) {
    return 'Sessão expirada. Faça login novamente.';
  }
  return msg || 'Erro ao salvar. Tente novamente.';
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

export interface ExerciseWithVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Modo do dialog: create (novo), edit (atualiza), customize (clona para o usuário logado) */
  mode?: 'create' | 'edit' | 'customize';
  editingExercise: Exercise | null;
  movementPatterns: MovementPattern[];
  /** Vídeo associado ao exercício (via exercises.video_id), para exibição no modo editar/personalizar */
  linkedVideo: Video | null;
}

export function ExerciseWithVideoDialog({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  editingExercise,
  movementPatterns,
  linkedVideo,
}: ExerciseWithVideoDialogProps) {
  const isEdit = mode === 'edit' && !!editingExercise;
  const isCustomize = mode === 'customize' && !!editingExercise;
  const linkedVideoOrNull = linkedVideo ?? null;

  const [formData, setFormData] = useState({
    name: '',
    movement_pattern_id: '',
    instructions: '',
    description: '',
    tags: [] as string[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [removeCurrentVideo, setRemoveCurrentVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressingImage, setCompressingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [linkedVideoUrl, setLinkedVideoUrl] = useState<string | null>(null);
  const [loadingLinkedVideoUrl, setLoadingLinkedVideoUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveInProgressRef = useRef(false);
  const errorAlertRef = useRef<HTMLDivElement>(null);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setMediaTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const isImageType = selectedFile ? selectedFile.type.startsWith('image/') : false;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaveSuccess(false);
    setSelectedFile(null);
    setMediaTitle('');
    setRemoveCurrentVideo(false);
    setLinkedVideoUrl(null);
    setCompressingImage(false);
    if (editingExercise) {
      setFormData({
        name: editingExercise.name || '',
        movement_pattern_id: editingExercise.movement_pattern_id || '',
        instructions: editingExercise.instructions || '',
        description: editingExercise.description || '',
        tags: editingExercise.tags || [],
      });
    } else {
      setFormData({
        name: '',
        movement_pattern_id: '',
        instructions: '',
        description: '',
        tags: [],
      });
    }
  }, [open, editingExercise]);

  // Carregar URL assinada do vídeo/imagem vinculado ao abrir em modo edição (não usar currentVideo aqui — é definido depois)
  useEffect(() => {
    const videoToShow = linkedVideoOrNull && !removeCurrentVideo && !selectedFile ? linkedVideoOrNull : null;
    if (!open || !videoToShow?.storage_path) {
      setLinkedVideoUrl(null);
      return;
    }
    const storagePath = videoToShow.storage_path;
    let cancelled = false;
    setLoadingLinkedVideoUrl(true);
    supabase.storage
      .from('exercise-videos')
      .createSignedUrl(storagePath, 86400)
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoadingLinkedVideoUrl(false);
        if (error) {
          console.warn('Erro ao obter URL do vídeo vinculado:', error);
          setLinkedVideoUrl(null);
          return;
        }
        setLinkedVideoUrl(data?.signedUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadingLinkedVideoUrl(false);
      });
    return () => { cancelled = true; };
  }, [open, linkedVideoOrNull, removeCurrentVideo, selectedFile]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use MP4, WebM, MOV, JPG, PNG, GIF ou WEBP.');
      return;
    }
    const maxSize = MAX_FILE_SIZE_BYTES;
    if (file.size > maxSize) {
      setError(`Arquivo muito grande. O limite é ${MAX_FILE_SIZE_MB} MB. Escolha um vídeo ou imagem menor.`);
      return;
    }
    const isImage = file.type.startsWith('image/');
    const isGif = file.type === 'image/gif';
    const shouldCompress = isImage && !isGif;

    if (shouldCompress) {
      setCompressingImage(true);
      setError(null);
      compressImageFile(file)
        .then((compressed) => {
          setSelectedFile(compressed);
          if (!mediaTitle) setMediaTitle(compressed.name.replace(/\.[^/.]+$/, ''));
          setCompressingImage(false);
        })
        .catch(() => {
          setSelectedFile(file);
          if (!mediaTitle) setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
          setCompressingImage(false);
          setError('Não foi possível comprimir a imagem. O arquivo original será usado.');
        });
    } else {
      setSelectedFile(file);
      if (!mediaTitle) setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
      setError(null);
    }
  };

  const handleSave = async () => {
    if (saveInProgressRef.current) return;
    if (!formData.name.trim()) {
      setError('Informe o nome do exercício.');
      return;
    }

    saveInProgressRef.current = true;
    setSaving(true);
    setError(null);
    setUploadProgress(0);

    try {
      const exercisePayload: CreateExerciseDTO = {
        name: formData.name.trim(),
        movement_pattern_id: movementPatternValue || undefined,
        instructions: formData.instructions?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      };

      let exerciseId: string;

      if (isEdit && editingExercise) {
        await exerciseService.updateExercise(editingExercise.id, {
          ...exercisePayload,
          video_id: removeCurrentVideo ? null : editingExercise.video_id ?? undefined,
        });
        exerciseId = editingExercise.id;
      } else {
        const created = await exerciseService.createExercise({
          ...exercisePayload,
          video_id: isCustomize && !selectedFile && !removeCurrentVideo ? linkedVideoOrNull?.id ?? null : undefined,
        });
        exerciseId = created.id;
      }

      if (selectedFile && mediaTitle.trim()) {
        setUploadProgress(10);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('exercise-videos')
          .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;

        setUploadProgress(60);
        const isVideo = selectedFile.type.startsWith('video/');
        const durationSeconds = isVideo ? await getVideoDuration(selectedFile) : 0;
        setUploadProgress(80);

        const videoData: CreateVideoDTO = {
          title: mediaTitle.trim(),
          description: null,
          storage_path: fileName,
          level: 'beginner',
          plane: 'frontal',
          type: 'demo',
          genre: 'strength',
          source: 'personal',
          duration_seconds: durationSeconds,
          file_size_kb: Math.round(selectedFile.size / 1024),
        };
        const video = await videoService.createVideo(videoData);
        setUploadProgress(90);
        await exerciseService.updateExercise(exerciseId, { video_id: video.id });
      }

      setUploadProgress(100);
      setSaveSuccess(true);
      // Feedback visível antes de fechar para evitar novo clique
      await new Promise((r) => setTimeout(r, 800));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar exercício com vídeo:', err);
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyMessage);
      errorAlertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      saveInProgressRef.current = false;
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  const currentVideo = removeCurrentVideo ? null : (linkedVideoOrNull && !selectedFile ? linkedVideoOrNull : null);

  // Evita valor fora da lista no Select (MUI exige value presente nas opções)
  const movementPatternIds = useMemo(() => new Set(movementPatterns.map((p) => p.id)), [movementPatterns]);
  const movementPatternValue = movementPatternIds.has(formData.movement_pattern_id)
    ? formData.movement_pattern_id
    : '';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '95vh' } }}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEdit
              ? `Editar exercício: ${editingExercise?.name}`
              : isCustomize
                ? `Personalizar exercício: ${editingExercise?.name}`
                : 'Novo exercício'}
          </Typography>
          <IconButton edge="end" onClick={handleClose} disabled={saving} aria-label="fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Dados do exercício */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Dados do exercício</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Nome do exercício *"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="ex: Agachamento Livre"
              fullWidth
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth disabled={saving}>
              <InputLabel>Padrão de movimento</InputLabel>
              <Select
                value={movementPatternValue}
                onChange={handleSelectChange('movement_pattern_id')}
                label="Padrão de movimento"
              >
                <MenuItem value=""><em>Nenhum</em></MenuItem>
                {movementPatterns.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              multiple
              freeSolo
              options={PREDEFINED_TAGS}
              value={formData.tags}
              onChange={(_, v) => setFormData((prev) => ({ ...prev, tags: v }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    variant="outlined"
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Digite ou selecione tags" />
              )}
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Instruções"
              value={formData.instructions}
              onChange={handleChange('instructions')}
              placeholder="Como executar o exercício"
              multiline
              rows={2}
              fullWidth
              disabled={saving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Dicas, cuidados"
              multiline
              rows={1}
              fullWidth
              disabled={saving}
            />
          </Grid>

          {/* Mídia do exercício (vídeo, GIF ou imagem estática) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>Mídia do exercício</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Vídeo (MP4, WebM, MOV), imagem (JPG, PNG, WEBP) ou GIF. Imagens são comprimidas automaticamente.
            </Typography>
          </Grid>
          {currentVideo && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                Vídeo/mídia atual
              </Typography>
              {loadingLinkedVideoUrl && (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Carregando mídia...</Typography>
                </Box>
              )}
              {!loadingLinkedVideoUrl && linkedVideoUrl && (
                <Box
                  sx={{
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'grey.900',
                    maxHeight: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(currentVideo.storage_path) ? (
                    <img
                      src={linkedVideoUrl}
                      alt={currentVideo.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 320,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <video
                      src={linkedVideoUrl}
                      controls
                      muted
                      loop
                      playsInline
                      style={{
                        maxWidth: '100%',
                        maxHeight: 320,
                      }}
                    />
                  )}
                </Box>
              )}
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">{currentVideo.title}</Typography>
                <Button size="small" onClick={() => setRemoveCurrentVideo(true)} disabled={saving}>
                  Remover mídia
                </Button>
              </Stack>
            </Grid>
          )}
          {removeCurrentVideo && isEdit && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">A mídia será desvinculada ao salvar.</Typography>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              disabled={saving || compressingImage}
              sx={{ py: 1.5 }}
            >
              {compressingImage ? 'Comprimindo imagem...' : selectedFile ? selectedFile.name : 'Selecionar mídia (vídeo, GIF ou imagem)'}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={saving || compressingImage}
              />
            </Button>
          </Grid>
          {compressingImage && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Redimensionando e comprimindo a imagem para reduzir o tamanho do upload…
              </Typography>
              <LinearProgress sx={{ mt: 0.5 }} />
            </Grid>
          )}
          {selectedFile && (
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Título da mídia"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="Ex: Demonstração frontal"
                  fullWidth
                  disabled={saving}
                />
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<RemoveIcon />}
                  onClick={clearSelectedFile}
                  disabled={saving}
                  sx={{ flexShrink: 0 }}
                >
                  Remover
                </Button>
              </Stack>
            </Grid>
          )}
          {/* Preview da mídia selecionada */}
          {selectedFile && previewUrl && (
            <Grid item xs={12}>
              <Box
                sx={{
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'grey.900',
                  maxHeight: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {isImageType ? (
                  <img
                    src={previewUrl}
                    alt="Preview da mídia"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 320,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    muted
                    loop
                    playsInline
                    style={{
                      maxWidth: '100%',
                      maxHeight: 320,
                    }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={clearSelectedFile}
                  disabled={saving}
                  aria-label="Remover mídia"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
                {selectedFile.type.startsWith('video/') && ' · Vídeo'}
                {selectedFile.type === 'image/gif' && ' · GIF'}
                {selectedFile.type.startsWith('image/') && selectedFile.type !== 'image/gif' && ' · Imagem'}
              </Typography>
            </Grid>
          )}

          {saving && (
            <Grid item xs={12}>
              {saveSuccess ? (
                <Alert severity="success" variant="filled">
                  Exercício salvo com sucesso! Fechando...
                </Alert>
              ) : (
                <>
                  <Typography variant="caption" color="text.secondary">Salvando... {uploadProgress}%</Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 0.5 }} />
                </>
              )}
            </Grid>
          )}
          {error && (
            <Grid item xs={12} ref={errorAlertRef}>
              <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : isEdit ? 'Salvar' : isCustomize ? 'Criar cópia' : 'Criar exercício'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
