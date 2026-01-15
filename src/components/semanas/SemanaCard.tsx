import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Tooltip,
  Checkbox,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { DiaCell } from './DiaCell';
import type { SemanaComTreinos } from '../../utils/semanaAdapter';
import { useWeeksSelection } from '../../contexts/WeeksSelectionContext';

interface SemanaCardProps {
  semana: SemanaComTreinos;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}

export const SemanaCard = ({ semana, onEdit, onDelete, onExport }: SemanaCardProps) => {
  const [open, setOpen] = useState(false);
  const { isSelected, toggleWeek } = useWeeksSelection();

  const dias = [
    { key: 'segunda', label: 'Segunda-feira', data: semana.dias.segunda },
    { key: 'terca', label: 'Terça-feira', data: semana.dias.terca },
    { key: 'quarta', label: 'Quarta-feira', data: semana.dias.quarta },
    { key: 'quinta', label: 'Quinta-feira', data: semana.dias.quinta },
    { key: 'sexta', label: 'Sexta-feira', data: semana.dias.sexta },
  ];

  return (
    <Card elevation={2} sx={{ width: '100%' }}>
      <CardContent sx={{ py: 0, px: 2 }}>
        {/* Header do Card */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="600">
              {semana.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {semana.focoSemana}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {new Date(semana.start_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              -{' '}
              {new Date(semana.end_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Checkbox
              checked={isSelected(semana.id)}
              onChange={() => toggleWeek(semana.id)}
              inputProps={{ 'aria-label': `Selecionar semana ${semana.name}` }}
              size="small"
            />
            <IconButton
              onClick={() => setOpen(!open)}
              sx={{
                transition: 'transform 0.3s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Conteúdo Expandido - Ações + Dias */}
        <Collapse in={open} timeout="auto" unmountOnExit>
          {/* Linha de ações (aparece apenas quando expandido) */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            {onExport && (
              <Tooltip title="Exportar Semana">
                <IconButton
                  aria-label="Exportar Semana"
                  onClick={() => onExport(semana.id)}
                  size="small"
                >
                  <PdfIcon color="secondary" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Editar Semana">
                <IconButton
                  aria-label="Editar Semana"
                  onClick={() => onEdit(semana.id)}
                  size="small"
                >
                  <EditIcon color="primary" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Excluir Semana">
                <IconButton
                  aria-label="Excluir Semana"
                  onClick={() => onDelete(semana.id)}
                  size="small"
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Box sx={{ mt: 2, mx: -2, p: 0 }}>
            {dias.map((dia) => (
              <Accordion
                key={dia.key}
                elevation={0}
                sx={{
                  '&:before': { display: 'none' },
                  bgcolor: 'transparent',
                  mb: 1,
                  p: 0,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: 'info.main',
                    borderRadius: 1,
                    minHeight: 48,
                    px: 2,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="600" padding={0}>
                    {dia.label}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, pt: 1.5 }}>
                  <DiaCell dia={dia.data} diaNome={dia.key} semanaId={semana.id} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
