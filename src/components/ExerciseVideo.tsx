import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface ExerciseVideoProps {
  videoUrl: string;
  alt?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

/**
 * Componente para exibir vídeos de exercícios
 * Comporta como GIF por padrão (autoplay, loop, muted)
 *
 * @example
 * // Comportamento de GIF (padrão)
 * <ExerciseVideo videoUrl={signedUrl} />
 *
 * // Com controles customizados
 * <ExerciseVideo videoUrl={signedUrl} showControls />
 *
 * // Com áudio
 * <ExerciseVideo videoUrl={signedUrl} muted={false} showControls />
 */
export function ExerciseVideo({
  videoUrl,
  alt = 'Demonstração do exercício',
  showControls = false,
  autoPlay = true,
  loop = true,
  muted = true,
  width = '100%',
  height = 'auto',
  borderRadius = 8,
}: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error('Erro ao reproduzir vídeo:', err);
        });
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Garantir que o vídeo começa com as configurações corretas
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <Box position="relative" width={width} height={height}>
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{ transform: 'translate(-50%, -50%)', zIndex: 1 }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '100%',
            height: 200,
            bgcolor: 'grey.200',
            borderRadius,
          }}
        >
          <Typography color="text.secondary">
            Não foi possível carregar o vídeo
          </Typography>
        </Box>
      )}

      {!error && (
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="auto"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius:
              typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            display: loading ? 'none' : 'block',
            objectFit: 'cover',
          }}
          aria-label={alt}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      )}

      {/* Controles customizados */}
      {showControls && !loading && !error && (
        <Box
          position="absolute"
          bottom={8}
          right={8}
          display="flex"
          gap={1}
          sx={{ zIndex: 2 }}
        >
          {/* Botão Play/Pause */}
          <IconButton
            onClick={togglePlay}
            size="small"
            sx={{
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>

          {/* Botão Mute/Unmute (se áudio estiver habilitado) */}
          {!muted && (
            <IconButton
              onClick={toggleMute}
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? (
                <VolumeOffIcon fontSize="small" />
              ) : (
                <VolumeUpIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}
