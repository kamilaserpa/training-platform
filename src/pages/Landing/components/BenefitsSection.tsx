import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DevicesIcon from '@mui/icons-material/Devices';

const BENEFITS = [
  {
    icon: AccessTimeIcon,
    title: 'Treinos de 30 minutos',
    text: 'Treinos personalizados que cabem na sua rotina. Sem desculpa de “não tenho tempo”: 30 min por dia já transformam.',
  },
  {
    icon: CalendarMonthIcon,
    title: 'Acompanhamento semanal',
    text: 'Feedback toda semana: ajustes no treino, dúvidas e motivação. Você não fica sozinha no processo.',
  },
  {
    icon: RestaurantIcon,
    title: 'Plano alimentar simples',
    text: 'Orientações práticas para comer melhor sem dieta maluca. Foco em hábitos que você consegue manter.',
  },
  {
    icon: DevicesIcon,
    title: 'Acompanhamento online',
    text: 'Plataforma online com treinos, envio de vídeos e feedback. Tudo no celular, no seu tempo.',
  },
];

export default function BenefitsSection() {
  return (
    <Box
      id="benefits"
      component="section"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            textAlign: 'center',
            '& em': { fontStyle: 'normal', color: 'primary.main' },
          }}
        >
          O que você <em>recebe</em>
        </Typography>
        <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: 'primary.main', mx: 'auto', my: 2 }} />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 560, mx: 'auto', mb: 6 }}>
          Um método pensado para mulher ocupada: treino curto, acompanhamento de verdade e alimentação sem neuras.
        </Typography>

        <Grid container spacing={4}>
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.soft',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Icon sx={{ color: 'primary.main', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
