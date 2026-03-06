import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ExerciseVideo } from './ExerciseVideo';

/** Altura máxima fixa da área de mídia (desktop). */
const MEDIA_VIEWER_MAX_HEIGHT = '70vh';
/** Altura da área de mídia no mobile (dialog menor, não ocupa a tela toda). */
const MEDIA_VIEWER_MAX_HEIGHT_MOBILE = '50vh';
/** Largura máxima fixa da área de mídia. */
const MEDIA_VIEWER_MAX_WIDTH = 900;

export interface MediaViewerDialogProps {
  open: boolean;
  onClose: () => void;
  /** URL da mídia (vídeo ou imagem, incluindo GIF). */
  mediaUrl: string;
  /** Título exibido no dialog (ex.: nome do exercício). */
  title: string;
  /** Texto alternativo para acessibilidade. */
  alt?: string;
}

/**
 * Dialog para visualização ampliada de mídia (vídeo ou imagem) do exercício.
 * Alinhado ao design system da aplicação, tamanho fixo para não exceder a tela,
 * título e botão fechar consistentes com os demais dialogs.
 */
export function MediaViewerDialog({
  open,
  onClose,
  mediaUrl,
  title,
  alt = 'Demonstração do exercício',
}: MediaViewerDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: isMobile ? '75vh' : '90vh',
          margin: isMobile ? 2 : 3,
          bgcolor: 'background.paper',
        },
      }}
      aria-labelledby="media-viewer-title"
      aria-describedby="media-viewer-content"
    >
      <DialogTitle
        id="media-viewer-title"
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          py: 1.5,
          pr: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          component="span"
          sx={{
            typography: 'h6',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Fechar"
          size="medium"
          color="inherit"
          sx={{ flexShrink: 0 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        id="media-viewer-content"
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: MEDIA_VIEWER_MAX_WIDTH,
            height: isMobile ? MEDIA_VIEWER_MAX_HEIGHT_MOBILE : MEDIA_VIEWER_MAX_HEIGHT,
            minHeight: isMobile ? 180 : 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'grey.200',
            boxShadow: 1,
          }}
        >
          <ExerciseVideo
            videoUrl={mediaUrl}
            alt={alt}
            showControls
            controlsVariant="primary"
            objectFit="contain"
            autoPlay={false}
            loop
            muted
            width="100%"
            height="100%"
            borderRadius={0}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
