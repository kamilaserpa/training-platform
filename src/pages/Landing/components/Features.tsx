import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const INTRO =
  'Profissional de Educação Física com sólida experiência em treinamento físico, aulas coletivas e programas de emagrecimento feminino. Pós-graduada em Treinamento de Alto Rendimento e Saúde, Musculação, Nutrição e Saúde. Atua há mais de 10 anos na área, com perfil dinâmico, comunicativo, alta energia, liderança em grupo e excelente relacionamento interpessoal.';

export default function Features() {
  return (
    <Box
      id="features"
      component="section"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              '& em': { fontStyle: 'normal', color: 'primary.main' },
            }}
          >
            Quem <em>sou eu</em>
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 4,
              mx: 'auto',
              my: 2,
              borderRadius: 2,
              bgcolor: 'primary.main',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'primary.soft',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'left' }}>
            {INTRO}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
