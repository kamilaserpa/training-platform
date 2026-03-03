import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const EMAIL = 'anacarolinaedf@gmail.com';
const PHONE = '(85) 99642-3872';
const PHONE_TEL = '+5585996423872';
const CREF = '011883-G/CE';
const INSTAGRAM = 'https://instagram.com/carolcavalcantefit';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrar com backend ou serviço de e-mail depois
  };

  return (
    <Box
      id="contact-us"
      component="section"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}
    >
      <Grid container sx={{ borderRadius: 0, overflow: 'hidden', boxShadow: 4 }}>
        <Grid item xs={12} md={6}>
          <Box
            component="iframe"
            src="https://maps.google.com/maps?q=Fortaleza,+CE,+Brazil&t=&z=12&ie=UTF8&iwloc=&output=embed"
            sx={{ width: '100%', height: 500, border: 0, display: 'block' }}
            title="Mapa Fortaleza, CE"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 4,
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
              Fale comigo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A forma mais rápida: me chame no <strong>Instagram</strong>. Ou preencha o formulário que entro em contato em até 24h.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              component="a"
              startIcon={<IconifyIcon icon="mdi:instagram" />}
              sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
            >
              Abrir Instagram
            </Button>
            <Box sx={{ mb: 3 }}>
              <Link href={`mailto:${EMAIL}`} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconifyIcon icon="ic:round-email" width={20} />
                {EMAIL}
              </Link>
              <Link href={`tel:${PHONE_TEL}`} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconifyIcon icon="ic:round-phone" width={20} />
                {PHONE}
              </Link>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconifyIcon icon="ic:round-badge" width={20} />
                CREF {CREF}
              </Typography>
              <Link href={INSTAGRAM} target="_blank" rel="noopener noreferrer" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <IconifyIcon icon="mdi:instagram" width={20} />
                @carolcavalcantefit
              </Link>
            </Box>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Celular"
                name="phone"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mensagem"
                name="message"
                multiline
                rows={3}
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ textTransform: 'none' }}>
                Enviar
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
