import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaViewerDialog } from './MediaViewerDialog';

/** Extensões consideradas imagem (inclui GIF). */
const IMAGE_EXT_REGEX = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;

function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const pathname = new URL(url, 'https://dummy').pathname;
    return IMAGE_EXT_REGEX.test(pathname);
  } catch {
    return IMAGE_EXT_REGEX.test(url);
  }
}

export interface ExerciseVideoProps {
  videoUrl: string;
  alt?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  /** 'cover' preenche o quadro; 'contain' garante que a mídia inteira apareça (ex.: no dialog). */
  objectFit?: 'cover' | 'contain';
  /** Se definido, ao clicar na mídia abre um dialog com visualização ampliada (título = nome do exercício). */
  viewerTitle?: string;
  /** 'overlay' = botões escuros sobre a mídia; 'primary' = botões com cor do tema, mais acessíveis. */
  controlsVariant?: 'overlay' | 'primary';
}

const sizeStyle = (
  width: string | number,
  height: string | number,
  borderRadius: string | number,
  display: string,
  objectFit: 'cover' | 'contain' = 'cover'
) => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: typeof height === 'number' ? `${height}px` : height,
  borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  display,
  objectFit,
});

/**
 * Componente para exibir vídeo ou imagem de exercício (inclui GIF).
 * Vídeo: comportamento tipo GIF por padrão (autoplay, loop, muted).
 * Imagem: exibe estática; GIF animado é exibido normalmente.
 *
 * @example
 * <ExerciseVideo videoUrl={signedUrl} />
 * <ExerciseVideo videoUrl={signedImageUrl} /> // PNG, JPEG, GIF, WebP, etc.
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
  objectFit = 'cover',
  viewerTitle,
  controlsVariant = 'overlay',
}: ExerciseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [viewerOpen, setViewerOpen] = useState(false);

  const isImage = isImageUrl(videoUrl);
  const isClickable = Boolean(viewerTitle && !error);
  const isPrimaryControls = controlsVariant === 'primary';

  const handleOpenViewer = useCallback(() => {
    if (isClickable) setViewerOpen(true);
  }, [isClickable]);

  const handleCloseViewer = useCallback(() => setViewerOpen(false), []);

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
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <>
      <Box
        position="relative"
        width={width}
        height={height}
        onClick={isClickable ? handleOpenViewer : undefined}
        sx={
          isClickable
            ? {
                cursor: 'pointer',
                '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                '&:focus:not(:focus-visible)': { outline: 'none' },
              }
            : undefined
        }
        role={isClickable ? 'button' : undefined}
        aria-label={isClickable ? `Ampliar mídia: ${viewerTitle}` : undefined}
      >
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
            {isImage ? 'Não foi possível carregar a imagem' : 'Não foi possível carregar o vídeo'}
          </Typography>
        </Box>
      )}

      {!error && isImage && (
        <img
          src={videoUrl}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          style={{
            ...sizeStyle(width, height, borderRadius, loading ? 'none' : 'block', objectFit),
            maxWidth: '100%',
          }}
        />
      )}

      {!error && !isImage && (
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
          style={sizeStyle(width, height, borderRadius, loading ? 'none' : 'block', objectFit)}
          aria-label={alt}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      )}

      {showControls && !loading && !error && !isImage && (
        <Box
          position="absolute"
          bottom={10}
          right={10}
          display="flex"
          gap={1}
          sx={{ zIndex: 2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={togglePlay}
            size={isPrimaryControls ? 'medium' : 'small'}
            color={isPrimaryControls ? 'primary' : 'inherit'}
            sx={
              isPrimaryControls
                ? {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }
                : {
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'white',
                      outlineOffset: 2,
                    },
                  }
            }
            aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          >
            {playing ? <PauseIcon fontSize={isPrimaryControls ? 'medium' : 'small'} /> : <PlayArrowIcon fontSize={isPrimaryControls ? 'medium' : 'small'} />}
          </IconButton>

          {!muted && (
            <IconButton
              onClick={toggleMute}
              size={isPrimaryControls ? 'medium' : 'small'}
              color={isPrimaryControls ? 'primary' : 'inherit'}
              sx={
                isPrimaryControls
                  ? {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 2,
                      },
                    }
                  : {
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'white',
                        outlineOffset: 2,
                      },
                    }
              }
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? (
                <VolumeOffIcon fontSize={isPrimaryControls ? 'medium' : 'small'} />
              ) : (
                <VolumeUpIcon fontSize={isPrimaryControls ? 'medium' : 'small'} />
              )}
            </IconButton>
          )}
        </Box>
      )}
      </Box>

      {viewerTitle && (
        <MediaViewerDialog
          open={viewerOpen}
          onClose={handleCloseViewer}
          mediaUrl={videoUrl}
          title={viewerTitle}
          alt={alt}
        />
      )}
    </>
  );
}
