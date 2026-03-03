import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { id: 'top', label: 'Início' },
  { id: 'pain', label: 'Pra você' },
  { id: 'features', label: 'Quem é a Carol' },
  { id: 'benefits', label: 'Benefícios' },
  { id: 'testimonials', label: 'Depoimentos' },
  { id: 'contact-us', label: 'Contato' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });
  const isSolid = trigger || mobileOpen;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        padding: 0,
        ...(isSolid
          ? { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 4 }
          : {
              backgroundColor: 'transparent !important',
              color: 'common.white',
              boxShadow: 'none',
              border: 'none',
              borderBottom: 'none',
            }),
        transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 56, md: 64 }, py: 0 }}>
          <Typography
            component="button"
            variant="h5"
            onClick={() => scrollToSection('top')}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isSolid ? 'text.primary' : 'common.white',
              '& em': { fontStyle: 'normal', color: 'primary.main' },
            }}
          >
            Carol<em> Cavalcante</em>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                color="inherit"
                onClick={() => scrollToSection(item.id)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: isSolid ? 'primary.main' : 'common.white',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => navigate(paths.signin)}
              sx={{ ml: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Login
            </Button>
          </Box>

          <IconButton
            color='primary'
            aria-label="menu"
            sx={{ display: { md: 'none' } }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <IconifyIcon icon="ic:round-menu" />
          </IconButton>
        </Toolbar>

        <Collapse
          in={mobileOpen}
          timeout={{ enter: 300, exit: 200 }}
          sx={{ display: { md: 'none' } }}
        >
          <Box
            sx={{
              py: 2,
              px: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 2,
              overflow: 'hidden',
            }}
          >
           
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  fullWidth
                  color="inherit"
                  onClick={() => {
                    scrollToSection(item.id);
                    setMobileOpen(false);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    minHeight: 48,
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  navigate(paths.signin);
                  setMobileOpen(false);
                }}
                sx={{ mt: 2, py: 1.5, textTransform: 'none', fontWeight: 600, minHeight: 48 }}
              >
                Login
              </Button>
          </Box>
        </Collapse>
      </Container>
    </AppBar>
  );
}
