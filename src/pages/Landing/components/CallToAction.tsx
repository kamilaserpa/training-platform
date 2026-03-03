import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

const INSTAGRAM_URL = 'https://instagram.com/carolcavalcantefit';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function CallToAction() {
  const theme = useTheme();

  return (
    <Box
      id="cta"
      component="section"
      sx={{
        py: 10,
        px: 2,
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'common.white',
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            '& em': { fontStyle: 'normal', color: 'primary.light' },
          }}
        >
          Pronta para <em>começar</em>?
        </Typography>
        <Typography sx={{ mt: 2, mb: 1, opacity: 0.95 }}>
          O primeiro passo é simples: me chame no Instagram.
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, opacity: 0.9 }}>
          Respondo em até 24h. Sem compromisso — vamos só conversar e ver se faz sentido para você.
        </Typography>
        <Button
          variant="contained"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          startIcon={<IconifyIcon icon="mdi:instagram" />}
          sx={{
            bgcolor: 'common.white',
            color: 'primary.main',
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 2,
            fontSize: '1.05rem',
            boxShadow: 4,
            '&:hover': { bgcolor: 'grey.100', boxShadow: 6 },
          }}
        >
          Chamar no Instagram
        </Button>
        <Typography variant="body2" sx={{ mt: 3, opacity: 0.85 }}>
          Ou preencha o formulário abaixo que eu entro em contato.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => scrollToSection('contact-us')}
          sx={{
            mt: 2,
            borderColor: 'common.white',
            color: 'common.white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          Preferir formulário
        </Button>
      </Container>
    </Box>
  );
}
