import {
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import paths from 'src/routes/paths';

const ShortcutWeek = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(paths.parametros);
  };

  return (
    <Stack
      component={Paper}
      p={2.5}
      alignItems="center"
      spacing={2.25}
      height={100}
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleNavigate();
        }
      }}
      role="button"
      tabIndex={0}
      sx={{
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary',
          outlineOffset: '2px',
        },
      }}
    >

      <Stack
        alignItems="center"
        justifyContent="center"
        height={16}
        width={16}
        bgcolor="info.main"
        borderRadius="50%"
      >
        <SettingsIcon fontSize="small" color="primary" />
      </Stack>
      <Stack direction="column" spacing={0.25} sx={{ width: 1 }}>
        <Typography variant="caption" color="text.disabled" noWrap display="block">
          Ir para
        </Typography>
        <Typography
          mt={0.25}
          variant="subtitle1"
          noWrap
          display="block"
          sx={{
            fontWeight: 700,
            maxWidth: '100%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: { xs: '0.95rem', sm: '1rem' },
          }}
        >
          Parâmetros
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ShortcutWeek;
