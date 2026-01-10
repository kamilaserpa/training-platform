import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Description as PdfIcon,
  TableChart as CsvIcon,
} from '@mui/icons-material';
import type { TrainingWeek } from '../../types/database.types';
import { exportToCSV, exportToPDF, exportBothFormats } from '../../services/exportService';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  weeks: TrainingWeek[];
}

export default function ExportModal({ open, onClose, weeks }: ExportModalProps) {
  const [exportCSV, setExportCSV] = useState(true);
  const [exportPDF, setExportPDF] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasData = weeks && weeks.length > 0;

  const handleExport = async () => {
    if (!exportCSV && !exportPDF) {
      setError('Selecione pelo menos um formato para exportar');
      return;
    }

    if (!hasData) {
      setError('Não há dados para exportar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular pequeno delay para UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (exportCSV && exportPDF) {
        exportBothFormats(weeks);
      } else if (exportCSV) {
        exportToCSV(weeks);
      } else if (exportPDF) {
        exportToPDF(weeks);
      }

      // Fechar modal após exportação bem-sucedida
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Erro ao exportar:', err);
      setError(err?.message || 'Erro ao exportar dados');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileDownloadIcon />
          Exportar Treinos Prescritos
        </Box>
      </DialogTitle>

      <DialogContent>
        {!hasData ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Não há semanas ou treinos para exportar. Configure seus treinos primeiro.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecione os formatos desejados para exportação dos dados prescritos:
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportCSV}
                    onChange={(e) => setExportCSV(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CsvIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">CSV (Excel/Sheets)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato tabular para análise em planilhas
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportPDF}
                    onChange={(e) => setExportPDF(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <PdfIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">PDF</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Formato estruturado para impressão e compartilhamento
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </FormGroup>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                <strong>O que será exportado:</strong>
                <br />
                • Semanas: nome, foco, período
                <br />
                • Treinos: nome, data, blocos
                <br />
                • Exercícios: protocolos e observações
                <br />
                <br />
                <em>Dados sensíveis e pessoais não serão incluídos.</em>
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || !hasData || (!exportCSV && !exportPDF)}
          startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
