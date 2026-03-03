import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import paths from 'routes/paths';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        textAlign: 'center',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container>
        <Typography variant="body1" fontWeight={600}>
          Carol Cavalcante
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CREF 011883-G/CE · Fortaleza, CE, Brasil
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <Link href="https://instagram.com/carolcavalcantefit" target="_blank" rel="noopener noreferrer" color="primary">
            @carolcavalcantefit
          </Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link component={RouterLink} to={paths.dashboard} color="primary" fontWeight={600}>
            Acessar o Dashboard
          </Link>
        </Typography>
        <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 2 }}>
          © {new Date().getFullYear()} Carol Cavalcante
        </Typography>
      </Container>
    </Box>
  );
}
