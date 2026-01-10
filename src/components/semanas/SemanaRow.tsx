import { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { DiaCell } from './DiaCell';
import type { SemanaComTreinos } from '../../utils/semanaAdapter';

interface SemanaRowProps {
  semana: SemanaComTreinos;
}

export const SemanaRow = ({ semana }: SemanaRowProps) => {
  const [open, setOpen] = useState(false);

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
        <TableCell>
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
            {new Date(semana.start_date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            })} - {new Date(semana.end_date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit',
              year: 'numeric'
            })}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell 
          style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }} 
          colSpan={4}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, px: 0 }}>
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
