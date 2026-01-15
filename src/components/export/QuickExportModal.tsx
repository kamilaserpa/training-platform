import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { SemanaComTreinos } from '../../utils/semanaAdapter';
import { exportToCSV, exportToPDF } from '../../services/exportService';
import { trainingService } from '../../services/trainingService';
import paths from '../../routes/paths';

interface QuickExportModalProps {
  open: boolean;
  onClose: () => void;
  semanasSelecionadas: SemanaComTreinos[];
}

export default function QuickExportModal({
  open,
  onClose,
  semanasSelecionadas,
}: QuickExportModalProps) {
  const navigate = useNavigate();

  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [pdfType, setPdfType] = useState<'resumo' | 'detalhado'>('resumo');
  const count = semanasSelecionadas.length;

  const title = useMemo(() => `Exportar ${count} semana${count > 1 ? 's' : ''}`, [count]);

  const handleExport = async () => {
    try {
      if (semanasSelecionadas.length === 0) {
        onClose();
        return;
      }
      // Carregar semanas com treinos antes de exportar
      const weeksWithTrainings = await trainingService.getWeeksWithTrainings();
      const selectedIds = new Set(semanasSelecionadas.map((s) => s.id));
      const targetWeeks = weeksWithTrainings.filter((w) => selectedIds.has(w.id));

      if (format === 'csv') {
        exportToCSV(targetWeeks as any);
        onClose();
        return;
      }

      if (pdfType === 'resumo') {
        if (targetWeeks.length === 1) {
          const [week] = targetWeeks as any[];
          const { generateSemanaPDF } = await import('../../utils/pdf/generateSemanaPDF.js');
          const { imageToBase64 } = await import('../../utils/pdf/pdfUtils.js');
          const logoImage = (await import('../../assets/images/logo-main.png')).default;
          const logoBase64 = await imageToBase64(logoImage as any);
          const treinos = await trainingService.getTrainingsByWeek(week.id);
          await generateSemanaPDF(week as any, treinos as any, logoBase64);
        } else {
          // Consolidado multi-semanas usando serviço existente
          exportToPDF(targetWeeks as any);
        }
        onClose();
        return;
      }

      // PDF detalhado: reutilizar gerador de treino (um PDF por treino)
      const trainings = targetWeeks.flatMap((w) => w.trainings || []);
      if (trainings.length === 0) {
        onClose();
        return;
      }

      const { generateTreinoPDF } = await import('../../utils/pdf/generateTreinoPDF.js');
      const { imageToBase64 } = await import('../../utils/pdf/pdfUtils.js');
      const logoImage = (await import('../../assets/images/logo-main.png')).default;
      const logoBase64 = await imageToBase64(logoImage as any);

      for (const treino of trainings) {
        await generateTreinoPDF(treino as any, logoBase64);
      }
      onClose();
    } catch (err) {
      console.error('Erro na exportação rápida:', err);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, width: 480 } }}
    >
      <DialogTitle>
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          {count === 1 && semanasSelecionadas[0] && (
            <Typography variant="body2" color="text.secondary">
              {semanasSelecionadas[0].name}
            </Typography>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Formato
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as 'pdf' | 'csv')}
              sx={{ width: '100%' }}
            >
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            </RadioGroup>
          </Box>

          {format === 'pdf' && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Opções PDF
              </Typography>
              <RadioGroup
                value={pdfType}
                onChange={(e) => setPdfType(e.target.value as 'resumo' | 'detalhado')}
                sx={{ width: '100%' }}
              >
                <FormControlLabel value="resumo" control={<Radio />} label="PDF resumo" />
                <FormControlLabel value="detalhado" control={<Radio />} label="PDF detalhado" />
              </RadioGroup>
              <Alert severity="info" sx={{ mt: 2 }}>
                PDF resumo é padrão. Multi-semanas gera PDF consolidado.
              </Alert>
            </Box>
          )}

          <Box sx={{ width: '100%' }}>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                onClose();
                navigate(paths.exportSettings);
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Ir para Exportação avançada
            </Button>
            <Typography variant="caption" color="text.secondary" display="block">
              Você será levado à página “Configurações de exportação”.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleExport}>
          {format === 'csv'
            ? 'Exportar CSV'
            : pdfType === 'resumo'
              ? 'Exportar PDF'
              : 'Exportar detalhado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
