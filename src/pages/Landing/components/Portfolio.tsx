import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const SERVICES = [
  {
    title: 'Modalidade Vibe',
    subtitle: 'Academia Carranca · Alive',
    text: 'Treinamento integrado: funcional, mobilidade e musculação. Aulas coletivas dinâmicas e motivacionais, com foco em execução segura e resultados.',
  },
  {
    title: 'CrossFit',
    subtitle: 'Academia Alive',
    text: 'Condução de aulas de CrossFit com alta energia, correção de movimento e prevenção de lesões. Engajamento e fidelização dos alunos.',
  },
  {
    title: 'Treinamento Funcional',
    subtitle: 'Academia Fitzone',
    text: 'Aulas coletivas e individuais de treinamento funcional. Integração de funcional, mobilidade e musculação, com planejamento adaptado aos objetivos.',
  },
  {
    title: 'Musculação e Personal',
    subtitle: 'Mandala Fitness · GHero Gym · Fitzone',
    text: 'Personal Trainer e professora de musculação. Atendimento personalizado, organização de rotinas de treino e acompanhamento de desempenho. Especialista em emagrecimento feminino.',
  },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function Portfolio() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box
      id="our-classes"
      component="section"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto', mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              '& em': { fontStyle: 'normal', color: 'primary.main' },
            }}
          >
            Serviços e <em>modalidades</em>
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
          <Typography variant="body1" color="text.secondary">
            Personal Trainer, aulas coletivas e programas com foco em resultados e sua melhor versão.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Tabs
              value={tabIndex}
              onChange={(_, v: number) => setTabIndex(v)}
              orientation="vertical"
              sx={{
                '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', fontSize: '1rem' },
                '& .Mui-selected': { color: 'primary.main', fontWeight: 600 },
              }}
            >
              {SERVICES.map((c, i) => (
                <Tab
                  key={i}
                  label={c.title}
                  icon={<FitnessCenterIcon sx={{ fontSize: 24 }} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, py: 1.5, textTransform: 'none' }}
              onClick={() => scrollToSection('contact-us')}
            >
              Fale comigo
            </Button>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {SERVICES[tabIndex].subtitle}
              </Typography>
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700, mb: 2, mt: 0.5 }}>
                {SERVICES[tabIndex].title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {SERVICES[tabIndex].text}
              </Typography>
              <Button variant="contained" color="primary" size="small" onClick={() => scrollToSection('contact-us')}>
                Agendar contato
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
