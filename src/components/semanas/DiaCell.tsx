import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TreinoResumo } from './TreinoResumo';
import paths from '../../routes/paths';
import type { Training } from '../../types/database.types';

interface DiaCellProps {
  dia: { treino?: Training };
  diaNome: string;
  semanaId: string;
}

export const DiaCell = ({ dia, diaNome, semanaId }: DiaCellProps) => {
  const navigate = useNavigate();

  const handleAdicionarTreino = () => {
    navigate(`${paths.treinoNovo}?semana=${semanaId}&dia=${diaNome}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}
    >
      {dia.treino ? (
        <TreinoResumo treino={dia.treino} />
      ) : (
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdicionarTreino}
          fullWidth
          sx={{
            borderStyle: 'dashed',
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          Adicionar treino
        </Button>
      )}
    </Box>
  );
};
