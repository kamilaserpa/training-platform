import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Videocam as VideoIcon,
} from '@mui/icons-material';
import { ExerciseVideo } from 'components/ExerciseVideo';
import { privateVideoStorage, signedUrlCache } from 'services/privateVideoStorage';

interface VideoUploadProps {
  exerciseId: string;
  currentVideoPath?: string;
  onUploadSuccess: (path: string, size: number) => void;
  onDelete: () => void;
}

export function VideoUpload({
  exerciseId,
  currentVideoPath,
  onUploadSuccess,
  onDelete,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Carregar vídeo atual se existir
  useState(() => {
    if (currentVideoPath) {
      signedUrlCache
        .getOrCreate(currentVideoPath)
        .then(setVideoUrl)
        .catch((err) => console.error('Erro ao carregar vídeo:', err));
    }
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Validar tipo
      const allowedTypes = ['video/mp4', 'video/webm', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'Formato não suportado.\nUse MP4, WEBM ou GIF.\nRecomendado: MP4 (menor tamanho)'
        );
      }

      // Simular progresso (Supabase não retorna progresso real)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Fazer upload
      const result = await privateVideoStorage.uploadVideo(file, exerciseId);

      clearInterval(progressInterval);
      setProgress(100);

      // Gerar URL assinada para preview
      const signedUrl = await signedUrlCache.getOrCreate(result.path);
      setVideoUrl(signedUrl);

      // Notificar sucesso
      onUploadSuccess(result.path, Math.round(result.size / 1024));

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro no upload:', err);
    } finally {
      setUploading(false);
      // Limpar input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentVideoPath) return;

    if (!confirm('Tem certeza que deseja deletar o vídeo?')) return;

    try {
      await privateVideoStorage.deleteVideo(currentVideoPath);
      setVideoUrl(null);
      signedUrlCache.clear(currentVideoPath);
      onDelete();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Vídeo Demonstrativo
      </Typography>

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Preview do vídeo atual */}
      {videoUrl && !uploading && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Vídeo atual
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={handleDelete}
                aria-label="Deletar vídeo"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            <ExerciseVideo videoUrl={videoUrl} />
          </CardContent>
        </Card>
      )}

      {/* Botão de upload */}
      <Button
        variant="outlined"
        startIcon={uploading ? null : videoUrl ? <VideoIcon /> : <UploadIcon />}
        onClick={handleFileSelect}
        disabled={uploading}
        fullWidth
      >
        {uploading ? 'Enviando...' : videoUrl ? 'Substituir Vídeo' : 'Adicionar Vídeo'}
      </Button>

      {/* Barra de progresso */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {progress}%
          </Typography>
        </Box>
      )}

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dicas */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Formatos: MP4 (recomendado), WEBM, GIF
        <br />
        📏 Tamanho máximo: 5 MB
        <br />
        🎬 Dica: Vídeos MP4 são 10-20× menores que GIF
      </Typography>
    </Box>
  );
}

