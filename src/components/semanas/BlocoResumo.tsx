import { Box, Typography, Stack } from '@mui/material';
import type { TrainingBlock } from '../../types/database.types';
import { formatarProtocolo } from '../../utils/semanaAdapter';

interface BlocoResumoProps {
  bloco: TrainingBlock;
}

export const BlocoResumo = ({ bloco }: BlocoResumoProps) => {
  // Ordenar prescriptions por order_index
  const prescriptions = bloco.exercise_prescriptions || [];
  const prescriptionsOrdenadas = [...prescriptions].sort((a, b) => a.order_index - b.order_index);

  // Pegar o protocolo do primeiro exercício (geralmente todos seguem o mesmo)
  const protocolo = prescriptionsOrdenadas.length > 0 
    ? formatarProtocolo(prescriptionsOrdenadas[0])
    : 'N/A';

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography 
        variant="caption" 
        fontWeight="600" 
        color="text.primary"
        sx={{ fontSize: '0.75rem' }}
      >
        {bloco.name} — {protocolo}
      </Typography>
      <Stack spacing={0.25} sx={{ ml: 1, mt: 0.5 }}>
        {prescriptionsOrdenadas.length > 0 ? (
          prescriptionsOrdenadas.map((prescription) => (
            <Typography
              key={prescription.id}
              variant="caption"
              color="text.secondary"
              sx={{ 
                fontSize: '0.7rem',
                '&::before': {
                  content: '"• "',
                  marginRight: 0.5
                }
              }}
            >
              {prescription.exercise?.name || 'Exercício sem nome'}
            </Typography>
          ))
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.7rem', fontStyle: 'italic' }}
          >
            Nenhum exercício cadastrado
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
