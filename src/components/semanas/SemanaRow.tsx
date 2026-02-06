import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useWeeksSelection } from '../../contexts/WeeksSelectionContext';
import { parseLocalDate } from '../../utils/date';
import type { SemanaComTreinos } from '../../utils/semanaAdapter';
import { DiaCell } from './DiaCell';

interface SemanaRowProps {
  semana: SemanaComTreinos;
  onEdit?: (semanaId: string) => void;
  onDelete?: (semanaId: string) => void;
  onExport?: (semanaId: string) => void;
}

export const SemanaRow = ({ semana, onEdit, onDelete, onExport }: SemanaRowProps) => {
  const [open, setOpen] = useState(false);
  const { isSelected, toggleWeek } = useWeeksSelection();

  const dias = [
    { key: 'segunda', label: 'SEG', data: semana.dias.segunda },
    { key: 'terca', label: 'TER', data: semana.dias.terca },
    { key: 'quarta', label: 'QUA', data: semana.dias.quarta },
    { key: 'quinta', label: 'QUI', data: semana.dias.quinta },
    { key: 'sexta', label: 'SEX', data: semana.dias.sexta }
  ];

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width={48}>
          <Checkbox
            size="small"
            checked={isSelected(semana.id)}
            onChange={() => toggleWeek(semana.id)}
            inputProps={{ 'aria-label': `Selecionar semana ${semana.name}` }}
          />
        </TableCell>
        <TableCell width={48}>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="subtitle2" fontWeight="600">
            Semana {semana.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {semana.focoSemana}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {parseLocalDate(semana.start_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })} - {parseLocalDate(semana.end_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {onExport && (
              <Tooltip title="Exportar Semana">
                <IconButton
                  size="small"
                  onClick={() => onExport(semana.id)}
                  color="info"
                  aria-label="Exportar Semana"
                >
                  <PdfIcon fontSize="small" color="secondary" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Editar semana">
                <IconButton
                  size="small"
                  onClick={() => onEdit(semana.id)}
                  color="primary"
                >
                  <EditIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Excluir semana">
                <IconButton
                  size="small"
                  onClick={() => onDelete(semana.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}
          colSpan={5}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, px: 0 }}>
              {/* Observações da Semana */}
              {semana.notes && (
                <Box sx={{ mb: 2, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {semana.notes}
                  </Typography>
                </Box>
              )}

              {/* Tabela de Dias da Semana */}
              <Table
                sx={{
                  tableLayout: 'fixed',
                  '& .MuiTableCell-root': {
                    verticalAlign: 'top',
                    px: 1
                  }
                }}
              >
                <TableHead>
                  <TableRow>
                    {dias.map((dia) => (
                      <TableCell
                        key={`header-${dia.key}`}
                        align="center"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}
                      >
                        {dia.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {dias.map((dia) => (
                      <TableCell
                        key={`content-${dia.key}`}
                        sx={{
                          p: 1,
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}
                      >
                        <DiaCell
                          dia={dia.data}
                          diaNome={dia.key}
                          semanaId={semana.id}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
