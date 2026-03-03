import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PAIN_POINTS = [
  'Você quer emagrecer mas a rotina não para e a academia ficou em segundo plano.',
  'Já assinou academia e desistiu — ou nem começou por achar que não vai dar conta.',
  'Quer resultados sem passar horas treinando e sem dieta maluca.',
  'Precisa de alguém que te entenda: mãe, trabalho, casa e ainda cuidar de si.',
  'Quer um plano que caiba na sua vida, com acompanhamento de verdade.',
];

function SectionDivider() {
  return (
    <Box
      sx={{
        width: 56,
        height: 4,
        borderRadius: 2,
        bgcolor: 'primary.main',
        mx: 'auto',
        my: 2,
      }}
    />
  );
}

export default function PainSection() {
  return (
    <Box
      id="pain"
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        bgcolor: 'background.paper',
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            textAlign: 'center',
            '& em': { fontStyle: 'normal', color: 'primary.main' },
          }}
        >
          Você se <em>identifica</em>?
        </Typography>
        <SectionDivider />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Muitas mulheres que chegam até mim vivem uma destas situações:
        </Typography>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {PAIN_POINTS.map((text, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.2s',
              }}
            >
              <CheckCircleOutlineIcon sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }} fontSize="small" />
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 3, fontStyle: 'italic' }}>
          Se pelo menos uma frase soou como a sua história, você está no lugar certo.
        </Typography>
      </Container>
    </Box>
  );
}
