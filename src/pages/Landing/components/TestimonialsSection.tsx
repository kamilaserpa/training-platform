import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

// Depoimentos placeholder — substituir por dados reais e fotos das alunas
const TESTIMONIALS = [
  {
    text: 'Consegui emagrecer e me sentir forte de novo. Os treinos de 30 min encaixaram na minha rotina de mãe e trabalho. A Carol entende a gente.',
    author: 'Aluna online',
    placeholder: true,
  },
  {
    text: 'Finalmente um acompanhamento que não é genérico. Plano alimentar simples e treino que eu consigo fazer em casa. Resultado que apareceu.',
    author: 'Aluna online',
    placeholder: true,
  },
  {
    text: 'Não achava que daria para conciliar tudo. Em 30 min por dia e com o suporte semanal, mudei hábitos e o corpo respondeu.',
    author: 'Aluna online',
    placeholder: true,
  },
];

export default function TestimonialsSection() {
  return (
    <Box
      id="testimonials"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
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
          Quem já <em>fez</em>
        </Typography>
        <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: 'primary.main', mx: 'auto', my: 2 }} />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 560, mx: 'auto', mb: 6 }}>
          Alunas online com resultados. Em breve, fotos de antes e depois das alunas (espaço reservado para inclusão).
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {TESTIMONIALS.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  position: 'relative',
                }}
              >
                <FormatQuoteIcon sx={{ color: 'primary.main', opacity: 0.5, position: 'absolute', top: 16, right: 16 }} />
                <Typography variant="body1" color="text.primary" sx={{ fontStyle: 'italic', lineHeight: 1.7, mb: 2 }}>
                  "{item.text}"
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  — {item.author}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Grid para fotos de alunas (antes/depois) — adicionar imagens depois */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
            Resultados das alunas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Espaço reservado para fotos de antes e depois (adicionar imagens quando disponíveis).
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[1, 2, 3].map((i) => (
              <Grid item xs={6} sm={4} key={i}>
                <Box
                  sx={{
                    aspectRatio: '3/4',
                    borderRadius: 2,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.400',
                  }}
                >
                  <Typography variant="caption" color="text.disabled">
                    Foto {i}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
