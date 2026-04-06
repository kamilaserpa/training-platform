import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { exerciseService } from '../../services/exerciseService';
import { NoTranslate } from '../common/NoTranslate';
import { ExerciseConfig, ExerciseConfigForm } from './ExerciseConfigForm';
import { ExerciseSelector, type ExerciseSelectorItem } from './ExerciseSelector';

type Step = 'exercise' | 'config';

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
  const [step, setStep] = useState<Step>(initialStep ?? (editMode ? 'config' : 'exercise'));
  const [selectedExercise, setSelectedExercise] = useState<ExerciseSelectorItem | null>(initialExercise);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(initialVideo);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseConfig>(initialConfig || {
    series: 3,
    repetitions: '',
    weight_kg: '',
    duration_seconds: 30,
    rest_seconds: 15,
    notes: '',
  });

  // Atualizar estados quando props mudarem (modo de edição)
  useEffect(() => {
    if (open) {
      setStep(initialStep ?? (editMode ? 'config' : 'exercise'));
      setSelectedExercise(initialExercise);
      setSelectedVideo(initialVideo);
      // Evita loader "preso" quando uma requisição anterior não finalizou
      setLoadingVideo(false);
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
    setLoadingVideo(false);
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

  const handleExerciseSelect = async (exercise: ExerciseSelectorItem) => {
    setSelectedExercise(exercise);
    setLoadingVideo(true);
    setSelectedVideo(null);
    try {
      const fullExercise = await Promise.race([
        exerciseService.getExerciseById(exercise.id),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Tempo esgotado ao carregar mídia do exercício.')), 8000)
        ),
      ]);
      const video = fullExercise?.video ?? null;
      setSelectedVideo(video);
    } catch (e) {
      setSelectedVideo(null);
    } finally {
      setLoadingVideo(false);
      setStep('config');
    }
  };

  const handleBack = () => {
    if (step === 'config') {
      setStep('exercise');
    }
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
      case 'config':
        return editMode ? 'Editar Configuração' : 'Configure o Exercício';
      default:
        return '';
    }
  };

  const steps = ['Exercício', 'Configuração'];
  const activeStep = step === 'exercise' ? 0 : 1;

  return (
    <Dialog
      open={open}
      onClose={(_: unknown, reason: string) => {
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
          <Box position="relative">
            {loadingVideo && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="rgba(255,255,255,0.8)"
                zIndex={10}
              >
                <CircularProgress />
              </Box>
            )}
            <ExerciseSelector
              onSelect={handleExerciseSelect}
              section={section}
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
