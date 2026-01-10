import { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  Stack,
  Tooltip 
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BlocoResumo } from './BlocoResumo';
import paths from '../../routes/paths';
import type { Training } from '../../types/database.types';

interface TreinoResumoProps {
  treino: Training;
}

export const TreinoResumo = ({ treino }: TreinoResumoProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleVerDetalhes = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(paths.treinoEditar(treino.id));
  };

  // Garantir que training_blocks existe e está ordenado
  const blocos = treino.training_blocks || [];
  const blocosOrdenados = [...blocos].sort((a, b) => a.order_index - b.order_index);

  return (
    <Box
      sx={{
        p: 0.5,
        bgcolor: 'background.paper',
        borderRadius: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header do Treino */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight="700"
          color="primary.main"
          sx={{ fontSize: '0.875rem' }}
        >
          {treino.name}
        </Typography>
        
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ver detalhes">
            <IconButton
              size="small"
              onClick={handleVerDetalhes}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <VisibilityIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{
              p: 0.5,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Conteúdo Expandido - Blocos */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ mt: 1.5 }}>
          {blocosOrdenados.length > 0 ? (
            blocosOrdenados.map((bloco) => (
              <BlocoResumo key={bloco.id} bloco={bloco} />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nenhum bloco cadastrado
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
