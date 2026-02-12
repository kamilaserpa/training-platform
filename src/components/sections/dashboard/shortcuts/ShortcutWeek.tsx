import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import paths from 'src/routes/paths';

const ShortcutWeek = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(paths.semanas);
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
        <CalendarIcon fontSize="small" color="primary" />
      </Stack>
      <div>
        <Typography variant="caption" color="text.disabled">
          Ir para
        </Typography>
        <Typography mt={0.25} style={{ fontWeight: 'bold' }} variant="subtitle1">
          Semanas
        </Typography>
      </div>
    </Stack>
  );
};

export default ShortcutWeek;
