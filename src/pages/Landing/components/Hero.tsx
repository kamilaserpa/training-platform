import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import HeroBg from 'assets/images/2.png';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  return (
    <Box
      id="top"
      sx={{
        position: 'relative',
        minHeight: { xs: '75vh', md: '88vh' },
        pt: { xs: 9, md: 10 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 45%, transparent 70%), url(${HeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        color: 'common.white',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, px: 2, py: 6, maxWidth: 720 }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            fontWeight: 700,
            letterSpacing: 2,
            opacity: 0.9,
            fontSize: '0.85rem',
          }}
        >
          Personal online · Fortaleza, CE
        </Typography>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            mt: 2,
            mb: 2,
            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.75rem' },
            lineHeight: 1.15,
            '& em': { fontStyle: 'normal', color: 'primary.main' },
          }}
        >
          Emagreça e se fortaleça em <em>30 minutos por dia</em> — com quem já viveu isso.
        </Typography>
        <Typography
          variant="h6"
          component="p"
          sx={{
            fontWeight: 500,
            opacity: 0.95,
            fontSize: { xs: '1rem', md: '1.15rem' },
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          Treinos personalizados, acompanhamento semanal e plano alimentar simples. Tudo online, no seu ritmo — sem precisar encarar academia cheia.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => scrollToSection('contact-us')}
          href="https://instagram.com/carolcavalcantefit"
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 2,
            fontSize: '1.05rem',
            boxShadow: 4,
            '&:hover': { boxShadow: 6 },
          }}
        >
          Quero começar pelo Instagram
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2, opacity: 0.8 }}>
          CREF 011883-G/CE · +10 anos de experiência
        </Typography>
      </Box>
    </Box>
  );
}
