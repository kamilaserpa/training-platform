import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { Video } from '../../types/database.types';
import { NoTranslate } from '../common/NoTranslate';
import { ExerciseConfig, ExerciseConfigForm } from './ExerciseConfigForm';
import { ExerciseSelector, type ExerciseSelectorItem } from './ExerciseSelector';
import { VideoSelector } from './VideoSelector';

type Step = 'exercise' | 'video' | 'config';

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    exercise: ExerciseSelectorItem;
    video: Video | null;
    config: ExerciseConfig;
  }) => void;
  initialStep?: Step;
  // Modo de edição
  editMode?: boolean;
  initialExercise?: ExerciseSelectorItem | null;
  initialVideo?: Video | null;
  initialConfig?: ExerciseConfig | null;
  // Seção do treino para priorização por tags
  section?: string;
}

export const AddExerciseModal = ({
  open,
  onClose,
  onSave,
  initialStep,
  editMode = false,
  initialExercise = null,
  initialVideo = null,
  initialConfig = null,
  section,
}: AddExerciseModalProps) => {
  const [step, setStep] = useState<Step>(initialStep ?? (editMode ? 'video' : 'exercise'));
  const [selectedExercise, setSelectedExercise] = useState<ExerciseSelectorItem | null>(initialExercise);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(initialVideo);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseConfig>(initialConfig || {
    series: 3,
    repetitions: '',
    weight_kg: '',
    duration_seconds: 30,
    rest_seconds: 0,
    notes: '',
  });

  // Atualizar estados quando props mudarem (modo de edição)
  useEffect(() => {
    if (open) {
      setStep(initialStep ?? (editMode ? 'video' : 'exercise'));
      setSelectedExercise(initialExercise);
      setSelectedVideo(initialVideo);
      setExerciseConfig(initialConfig || {
        series: 3,
        repetitions: '',
        weight_kg: '',
        duration_seconds: 30,
        rest_seconds: 0,
        notes: '',
      });
    }
  }, [open, editMode, initialStep, initialExercise, initialVideo, initialConfig]);

  const handleClose = () => {
    // Reset state
    setStep('exercise');
    setSelectedExercise(null);
    setSelectedVideo(null);
    setExerciseConfig({
      series: 3,
      repetitions: '12',
      weight_kg: '',
      duration_seconds: null,
      rest_seconds: 0,
      notes: '',
    });
    onClose();
  };

  const handleExerciseSelect = (exercise: ExerciseSelectorItem) => {
    setSelectedExercise(exercise);
    setStep('video');
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBack = () => {
    if (step === 'video') {
      setStep('exercise');
    } else if (step === 'config') {
      setStep('video');
    }
  };

  const handleSkipVideo = () => {
    setSelectedVideo(null);
    setStep('config');
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    // Não avança o step, fica na seleção de vídeo para o usuário escolher outro ou pular
  };

  const handleSave = () => {
    if (!selectedExercise) return;

    onSave({
      exercise: selectedExercise,
      video: selectedVideo,
      config: exerciseConfig,
    });

    handleClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 'exercise':
        return editMode ? 'Trocar Exercício' : 'Selecione o Exercício';
      case 'video':
        return editMode ? 'Alterar Vídeo (opcional)' : 'Selecione o Vídeo';
      case 'config':
        return editMode ? 'Editar Configuração' : 'Configure o Exercício';
      default:
        return '';
    }
  };

  const steps = ['Exercício', 'Vídeo', 'Configuração'];
  const activeStep = step === 'exercise' ? 0 : step === 'video' ? 1 : 2;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Previne fechar com ESC quando não está no primeiro step
        if (reason === 'escapeKeyDown' && step !== 'exercise') {
          return;
        }
        handleClose();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {step !== 'exercise' && (
              <IconButton
                size="small"
                onClick={handleBack}
                aria-label="voltar"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {getStepTitle()}
            </Typography>
            {editMode && selectedExercise && step !== 'exercise' && (
              <Chip
                label={<NoTranslate>{selectedExercise.name}</NoTranslate>}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="fechar"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Box mt={2}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {step === 'exercise' && (
          <ExerciseSelector
            onSelect={handleExerciseSelect}
            section={section}
          />
        )}

        {step === 'video' && selectedExercise && (
          <Box>
            {editMode && (
              <Box
                bgcolor="info.lighter"
                borderRadius={1}
                sx={{ display: { xs: 'none', sm: 'block' }, p: 1, mb: 2 }}
              >
                <Typography variant="body2">
                  Selecione um vídeo e clique em "Avançar". Você também pode seguir sem vídeo.
                </Typography>
              </Box>
            )}
            <VideoSelector
              exerciseId={selectedExercise.id}
              onSelect={handleVideoSelect}
              selectedVideoId={selectedVideo?.id}
            />
          </Box>
        )}

        {step === 'config' && selectedExercise && (
          <ExerciseConfigForm
            exercise={{ id: selectedExercise.id, name: selectedExercise.name } as any}
            video={selectedVideo}
            initialValues={exerciseConfig}
            onChange={setExerciseConfig}
          />
        )}
      </DialogContent>

      {/* Dialog actions bottom */}
      <DialogActions
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1 },
          px: 3,
          py: 2,
          '& > button': {
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 100 },
          },
        }}
      >
        {step === 'video' && (
          <>
            {selectedVideo && (
              <Button
                onClick={handleRemoveVideo}
                variant="outlined"
                color="inherit"
              >
                Remover vídeo
              </Button>
            )}
            <Button
              onClick={() => setStep('config')}
              variant="contained"
            >
              Avançar
            </Button>
          </>
        )}

        {step === 'config' && (
          <>
            <Button onClick={handleClose} variant="outlined" color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!selectedExercise}
            >
              {editMode ? 'Salvar Alterações' : 'Adicionar Exercício'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
