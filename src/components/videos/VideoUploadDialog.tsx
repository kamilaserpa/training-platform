import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { videoService } from '../../services/videoService';
import type { CreateVideoDTO } from '../../types/database.types';

interface VideoUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface VideoFormData {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  plane: 'frontal' | 'lateral' | 'dorsal' | 'detail';
  type: 'demo' | 'education';
  genre: 'strength' | 'cardio' | 'mobility' | 'core' | 'balance' | 'flexibility' | 'power' | 'endurance' | 'other';
  source: 'platform' | 'personal';
}

const VideoUploadDialog = ({ open, onClose, onSuccess }: VideoUploadDialogProps) => {
  const { user, loading, isAdmin } = useAuth();
  const canSelectSource = !loading && (isAdmin || user?.role === 'admin');
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    level: 'beginner',
    plane: 'frontal',
    type: 'demo',
    genre: 'strength',
    source: 'personal',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof VideoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = [
        'video/mp4', 'video/webm', 'video/quicktime',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
      ];
      if (!validTypes.includes(file.type)) {
        setError('Formato inválido. Use MP4, WebM, MOV, JPG, PNG, GIF ou WEBP.');
        return;
      }

      // Validar tamanho (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Arquivo muito grande. Máximo 500MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Auto-preencher título se estiver vazio
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extensão
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };

      video.onerror = () => {
        resolve(0);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo de mídia');
      return;
    }

    if (!formData.title.trim()) {
      setError('Digite um título para o vídeo');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload para Supabase Storage
      setUploadProgress(10);
      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Obter duração apenas para vídeos
      const isVideo = selectedFile.type.startsWith('video/');
      const durationSeconds = isVideo ? await getVideoDuration(selectedFile) : 0;

      setUploadProgress(80);

      // Criar registro no banco
      const videoData: CreateVideoDTO = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        storage_path: fileName,
        level: formData.level,
        plane: formData.plane,
        type: formData.type,
        genre: formData.genre,
        // Forçar 'personal' para não-admin; admins podem escolher
        source: canSelectSource ? formData.source : 'personal',
        duration_seconds: durationSeconds,
        file_size_kb: Math.round(selectedFile.size / 1024),
      };

      await videoService.createVideo(videoData);

      setUploadProgress(100);

      // Sucesso
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 500);
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      setError(err.message || 'Erro ao fazer upload da mídia');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;

    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      plane: 'frontal',
      type: 'demo',
      genre: 'strength',
      source: 'personal',
    });
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Nova Mídia</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            disabled={uploading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={4}>
          {/* Upload de arquivo */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{ py: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Selecionar Mídia'}
              <input
                type="file"
                hidden
                accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </Button>
            {selectedFile && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Tamanho: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            )}
          </Grid>

          {/* Título */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={uploading}
              placeholder="Ex: Agachamento - Vista Frontal"
            />
          </Grid>

          {/* Descrição */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={uploading}
              placeholder="Descrição opcional do vídeo..."
            />
          </Grid>

          {/* Nível */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={uploading}>
              <InputLabel>Nível</InputLabel>
              <Select
                value={formData.level}
                label="Nível"
                onChange={(e) => handleInputChange('level', e.target.value)}
              >
                <MenuItem value="beginner">Iniciante</MenuItem>
                <MenuItem value="intermediate">Intermediário</MenuItem>
                <MenuItem value="advanced">Avançado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Plano */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={uploading}>
              <InputLabel>Plano de Visão</InputLabel>
              <Select
                value={formData.plane}
                label="Plano de Visão"
                onChange={(e) => handleInputChange('plane', e.target.value)}
              >
                <MenuItem value="frontal">Frontal</MenuItem>
                <MenuItem value="lateral">Lateral</MenuItem>
                <MenuItem value="dorsal">Dorsal</MenuItem>
                <MenuItem value="detail">Detalhe</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tipo */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={uploading}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.type}
                label="Tipo"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <MenuItem value="demo">Demonstração</MenuItem>
                <MenuItem value="education">Educativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Gênero */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={uploading}>
              <InputLabel>Gênero</InputLabel>
              <Select
                value={formData.genre}
                label="Gênero"
                onChange={(e) => handleInputChange('genre', e.target.value)}
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

          {/* Origem (visível apenas para admin) */}
          {canSelectSource && (
            <Grid item xs={12}>
              <FormControl fullWidth disabled={uploading}>
                <InputLabel>Origem</InputLabel>
                <Select
                  value={formData.source}
                  label="Origem"
                  onChange={(e) => handleInputChange('source', e.target.value)}
                >
                  <MenuItem value="personal">Pessoal</MenuItem>
                  <MenuItem value="platform">Plataforma</MenuItem>
                </Select>
                <FormHelperText>
                  Vídeos da plataforma são visíveis para todos os usuários
                </FormHelperText>
              </FormControl>
            </Grid>
          )}

          {/* Progress Bar */}
          {uploading && (
            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fazendo upload... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            </Grid>
          )}

          {/* Erro */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          startIcon={<UploadIcon />}
        >
          {uploading ? 'Enviando...' : 'Fazer Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoUploadDialog;
