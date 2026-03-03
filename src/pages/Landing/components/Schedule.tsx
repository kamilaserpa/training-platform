import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';

const FORMATION = [
  { title: 'Licenciatura em Educação Física', place: 'Uni Fametro', year: '2015' },
  { title: 'Bacharelado em Educação Física', place: 'Uni Ateneu', year: '2020' },
  { title: 'Pós-graduação em Treinamento de Alto Rendimento e Saúde', place: 'Integrar Movimento' },
  { title: 'Pós-graduação em Musculação, Nutrição e Saúde', place: 'Integrar Movimento' },
  { title: 'Curso Avaliação Física', place: 'EQUIPE CORPO' },
  { title: 'Curso Personal Trainer', place: 'CONAFF' },
  { title: 'Curso Nutrição e Suplementação', place: 'CONAFF' },
  { title: 'Congresso Internacional de Atividade Física, Fisioterapia e Nutrição' },
];

const HIGHLIGHTS = [
  'Condução de aulas coletivas dinâmicas, motivacionais e adaptadas',
  'Engajamento e fidelização de alunos',
  'Organização de rotinas de treino e acompanhamento de desempenho',
  'Correção de execução e prevenção de lesões',
  'Participação em treinamentos, capacitações e eventos',
  'Atendimento personalizado com foco em resultados',
  'Especialista em emagrecimento feminino',
  'Alta energia, comunicação clara e liderança em grupo',
];

export default function Schedule() {
  const theme = useTheme();

  return (
    <Box
      id="about-formation"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        px: 2,
        background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
        color: 'common.white',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto', mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'common.white',
              '& em': { fontStyle: 'normal', color: 'primary.main' },
            }}
          >
            Formação e <em>destaques</em>
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
          <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Formação acadêmica, cursos e competências que fazem a diferença no seu treino.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Formação acadêmica e cursos
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 1.5 } }}>
                {FORMATION.map((item, i) => (
                  <Typography key={i} component="li" variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {item.title}
                    {item.place && ` — ${item.place}`}
                    {item.year && ` (${item.year})`}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StarIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Destaques profissionais
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 1 } }}>
                {HIGHLIGHTS.map((item, i) => (
                  <Typography key={i} component="li" variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
