import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';

const STORY =
  'Eu já passei por diástase abdominal pós-gravidez e pela necessidade de emagrecer. Sei o que é colocar a gente em último lugar — e o que é decidir mudar. Hoje ajudo mulheres 30+ a emagrecer e se fortalecer com treinos de 30 minutos que cabem na rotina, acompanhamento semanal e plano alimentar simples. Tudo online, com suporte e feedback na plataforma.';

const CREDENTIALS = [
  'Mais de 10 anos de experiência em treinamento físico',
  'Pós-graduada em Treinamento de Alto Rendimento e Saúde',
  'Pós-graduada em Musculação, Nutrição e Saúde',
  'Especialista em emagrecimento feminino',
  'Licenciatura e Bacharelado em Educação Física',
  'CREF 011883-G/CE',
];

export default function AuthoritySection() {
  const theme = useTheme();

  return (
    <Box
      id="features"
      component="section"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}
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
          Quem é a <em>Carol</em>
        </Typography>
        <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: 'primary.main', mx: 'auto', my: 2 }} />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 640, mx: 'auto', mb: 4 }}>
          Não falo só de teoria. Falo de caminho percorrido.
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'primary.soft',
                borderLeft: 4,
                borderColor: 'primary.main',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FavoriteIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Minha história
                </Typography>
              </Box>
              <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                {STORY}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Formação e atuação
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 1 } }}>
                {CREDENTIALS.map((item, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
