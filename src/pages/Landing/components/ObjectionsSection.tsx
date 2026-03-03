import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const OBJECTIONS = [
  {
    q: 'Não tenho tempo.',
    a: 'Treinos de 30 minutos. Você escolhe o horário. Treina em casa ou onde estiver, pela plataforma.',
  },
  {
    q: 'Já tentei de tudo e não emagreci.',
    a: 'Aqui o foco é acompanhamento de verdade: plano alimentar simples + treino personalizado + feedback semanal. Sem dieta restritiva maluca.',
  },
  {
    q: 'Não consigo ser fiel à academia.',
    a: 'Tudo online. Sem deslocamento, sem turma olhando. Você treina no seu ritmo, com suporte da Carol.',
  },
  {
    q: 'Tenho diástase / fui mãe recentemente.',
    a: 'A Carol passou por diástase pós-gravidez e por processo de emagrecimento. O trabalho é adaptado e seguro para o seu momento.',
  },
];

export default function ObjectionsSection() {
  const theme = useTheme();

  return (
    <Box
      id="objections"
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <HelpOutlineIcon sx={{ color: 'primary.main' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              '& em': { fontStyle: 'normal', color: 'primary.main' },
            }}
          >
            E se <em>…?</em>
          </Typography>
        </Box>
        <Box sx={{ width: 56, height: 4, borderRadius: 2, bgcolor: 'primary.main', mx: 'auto', mb: 4 }} />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Respostas diretas para as dúvidas que mais aparecem.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OBJECTIONS.map(({ q, a }, i) => (
            <Box
              key={i}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                borderLeft: 4,
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                {q}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {a}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
