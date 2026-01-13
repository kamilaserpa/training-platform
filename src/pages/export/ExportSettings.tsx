import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  Grid,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useWeeksSelection } from '../../contexts/WeeksSelectionContext';
import { trainingService } from '../../services/trainingService';
import { exportToCSV, exportToPDF } from '../../services/exportService';

export default function ExportSettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedWeekIds } = useWeeksSelection();
  const navigate = useNavigate();

  const [periodType, setPeriodType] = useState<
    'selecionadas' | 'mes' | 'ciclo' | 'semestre' | 'intervalo'
  >(selectedWeekIds.length > 0 ? 'selecionadas' : 'mes');
  const [monthYear, setMonthYear] = useState<string>(`${dayjs().format('YYYY')}-01`);
  const [cycleLength, setCycleLength] = useState<number>(4);
  const [cycleStartWeekId, setCycleStartWeekId] = useState<string>('');
  const [semester, setSemester] = useState<'1' | '2'>('1');
  const [semesterYear, setSemesterYear] = useState<number>(dayjs().year());
  const [intervalStartWeekId, setIntervalStartWeekId] = useState<string>('');
  const [intervalEndWeekId, setIntervalEndWeekId] = useState<string>('');
  const [format, setFormat] = useState<'pdf-resumo' | 'pdf-detalhado' | 'zip' | 'csv'>(
    'pdf-resumo',
  );
  const [weeks, setWeeks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAllSelected, setShowAllSelected] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const weeksWithTrainings = await trainingService.getWeeksWithTrainings();
        setWeeks(weeksWithTrainings);
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar semanas');
      }
    };
    load();
  }, []);

  const targetWeeks = useMemo(() => {
    if (weeks.length === 0) return [] as any[];
    if (periodType === 'selecionadas') {
      const ids = new Set(selectedWeekIds);
      return weeks.filter((w) => ids.has(w.id));
    }
    if (periodType === 'mes') {
      const [yearStr, monthStr] = monthYear.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return weeks.filter((w) => {
        const d = new Date(w.start_date);
        return d >= start && d <= end;
      });
    }
    if (periodType === 'ciclo') {
      if (!cycleStartWeekId) return [];
      const sorted = [...weeks].sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
      const idx = sorted.findIndex((w) => w.id === cycleStartWeekId);
      if (idx === -1) return [];
      return sorted.slice(idx, idx + cycleLength);
    }
    if (periodType === 'semestre') {
      const y = semesterYear;
      const start = new Date(y, semester === '1' ? 0 : 6, 1);
      const end = new Date(y, semester === '1' ? 6 : 12, 0);
      return weeks.filter((w) => {
        const d = new Date(w.start_date);
        return d >= start && d <= end;
      });
    }
    if (periodType === 'intervalo') {
      if (!intervalStartWeekId || !intervalEndWeekId) return [];
      const sorted = [...weeks].sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
      const startIdx = sorted.findIndex((w) => w.id === intervalStartWeekId);
      const endIdx = sorted.findIndex((w) => w.id === intervalEndWeekId);
      if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return [];
      return sorted.slice(startIdx, endIdx + 1);
    }
    return [];
  }, [
    weeks,
    selectedWeekIds,
    periodType,
    monthYear,
    cycleLength,
    cycleStartWeekId,
    semester,
    semesterYear,
    intervalStartWeekId,
    intervalEndWeekId,
  ]);

  const selectedWeeksDetailed = useMemo(() => {
    if (weeks.length === 0 || selectedWeekIds.length === 0) return [] as any[];
    const ids = new Set(selectedWeekIds);
    return weeks.filter((w) => ids.has(w.id));
  }, [weeks, selectedWeekIds]);

  const canExport = useMemo(() => {
    if (format === 'zip') return true; // placeholder allowed
    if (periodType === 'selecionadas') return selectedWeeksDetailed.length > 0;
    if (periodType === 'intervalo') return !!intervalStartWeekId && !!intervalEndWeekId;
    return targetWeeks.length > 0;
  }, [
    format,
    periodType,
    selectedWeeksDetailed.length,
    intervalStartWeekId,
    intervalEndWeekId,
    targetWeeks.length,
  ]);

  const handleExport = async () => {
    try {
      if (targetWeeks.length === 0) return;
      if (format === 'csv') {
        exportToCSV(targetWeeks as any);
        return;
      }
      if (format === 'pdf-resumo') {
        if (targetWeeks.length === 1) {
          const [week] = targetWeeks as any[];
          const { generateSemanaPDF } = await import('../../utils/pdf/generateSemanaPDF.js');
          const { imageToBase64 } = await import('../../utils/pdf/pdfUtils.js');
          const logoImage = (await import('../../assets/images/logo-main.png')).default;
          const logoBase64 = await imageToBase64(logoImage as any);
          const treinos = week.trainings || [];
          await generateSemanaPDF(week as any, treinos as any, logoBase64);
        } else {
          // Consolidado multi-semanas
          exportToPDF(targetWeeks as any);
        }
        return;
      }
      if (format === 'pdf-detalhado') {
        const { generateTreinoPDF } = await import('../../utils/pdf/generateTreinoPDF.js');
        const { imageToBase64 } = await import('../../utils/pdf/pdfUtils.js');
        const logoImage = (await import('../../assets/images/logo-main.png')).default;
        const logoBase64 = await imageToBase64(logoImage as any);
        for (const w of targetWeeks) {
          for (const treino of w.trainings || []) {
            await generateTreinoPDF(treino as any, logoBase64);
          }
        }
        return;
      }
      if (format === 'zip') {
        // TODO: ZIP PDFs individuais (requer biblioteca JSZip). Mantendo fora para evitar alterar lógica existente.
        alert(
          'ZIP de PDFs individuais será disponibilizado em breve. Por enquanto, use PDF detalhado para baixar individualmente.',
        );
        return;
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 0, sm: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Exportação Avançada
      </Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 4, sm: 3 }}>
          {/* Período */}
          <Grid item xs={12} pb={4}>
            <Typography variant="subtitle2" gutterBottom>
              Período
            </Typography>
            <RadioGroup value={periodType} onChange={(e) => setPeriodType(e.target.value as any)}>
              <FormControlLabel
                value="selecionadas"
                control={<Radio />}
                label="Semanas selecionadas"
              />
              <FormControlLabel value="mes" control={<Radio />} label="Mês" />
              <FormControlLabel value="ciclo" control={<Radio />} label="Ciclo" />
              <FormControlLabel value="semestre" control={<Radio />} label="Semestre" />
              <FormControlLabel
                value="intervalo"
                control={<Radio />}
                label="Intervalo personalizado"
              />
            </RadioGroup>
            {periodType === 'selecionadas' && (
              <Box sx={{ mt: 1 }}>
                {selectedWeeksDetailed.length === 0 ? (
                  <Alert severity="warning">
                    Nenhuma semana selecionada. Você pode selecionar semanas na página Semanas ou
                    escolher outro período.
                  </Alert>
                ) : (
                  <Grid container>
                    <Grid
                      container
                      item
                      xs={12}
                      direction="row"
                      spacing={1}
                      wrap="nowrap"
                      alignItems="center"
                    >
                      {selectedWeeksDetailed.slice(0, 3).map((w) => (
                        <Chip
                          key={w.id}
                          label={`Sem ${dayjs(w.start_date).format('DD/MM/YYYY')}`}
                          size="small"
                        />
                      ))}
                      {selectedWeeksDetailed.length > 3 && (
                        <Chip label={`+${selectedWeeksDetailed.length - 3}`} size="small" />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setShowAllSelected((v) => !v)}
                        aria-label="Ver todas"
                      >
                        <ExpandMoreIcon
                          sx={{
                            transform: showAllSelected ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                      <Collapse in={showAllSelected}>
                        <Box
                          sx={{
                            maxHeight: 200,
                            overflowY: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Stack spacing={0.5}>
                            {selectedWeeksDetailed.map((w) => (
                              <Typography key={w.id} variant="caption" color="text.secondary">
                                Semana {w.name} — {dayjs(w.start_date).format('DD/MM/YYYY')} até{' '}
                                {dayjs(w.end_date).format('DD/MM/YYYY')}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      </Collapse>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/pages/semanas')}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        Editar seleção
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Grid>

          {/* Mês */}
          {periodType === 'mes' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Mês"
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                fullWidth
              />
            </Grid>
          )}

          {/* Ciclo */}
          {periodType === 'ciclo' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Ciclo"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
                  fullWidth
                >
                  {[4, 6, 8, 12].map((len) => (
                    <MenuItem key={len} value={len}>
                      {len} semanas
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <TextField
                  select
                  label="Início"
                  value={cycleStartWeekId}
                  onChange={(e) => setCycleStartWeekId(e.target.value)}
                  helperText="Escolha a semana inicial"
                  fullWidth
                >
                  {weeks.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      Semana {w.name} ({dayjs(w.start_date).format('DD/MM/YYYY')})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}

          {/* Semestre */}
          {periodType === 'semestre' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Semestre"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as any)}
                  fullWidth
                >
                  <MenuItem value="1">1º semestre</MenuItem>
                  <MenuItem value="2">2º semestre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Ano"
                  type="number"
                  value={semesterYear}
                  onChange={(e) => setSemesterYear(parseInt(e.target.value, 10))}
                  fullWidth
                />
              </Grid>
            </>
          )}

          {/* Intervalo personalizado */}
          {periodType === 'intervalo' && (
            <>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Semana inicial"
                  value={intervalStartWeekId}
                  onChange={(e) => setIntervalStartWeekId(e.target.value)}
                  fullWidth
                >
                  {weeks.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      Semana {w.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  label="Semana final"
                  value={intervalEndWeekId}
                  onChange={(e) => setIntervalEndWeekId(e.target.value)}
                  fullWidth
                >
                  {weeks.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      Semana {w.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}

          {/* Formato */}
          <Grid item xs={12} pt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Formato
            </Typography>
            <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as any)}>
              <FormControlLabel value="pdf-resumo" control={<Radio />} label="PDF resumo" />
              <FormControlLabel value="pdf-detalhado" control={<Radio />} label="PDF detalhado" />
              <FormControlLabel value="zip" control={<Radio />} label="ZIP (PDFs individuais)" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            </RadioGroup>
          </Grid>

          {/* Erro */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Ações */}
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleExport}
                disabled={!canExport}
                fullWidth={isMobile}
              >
                Exportar
              </Button>
              <Button variant="outlined" onClick={() => history.back()} fullWidth={isMobile}>
                Cancelar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
