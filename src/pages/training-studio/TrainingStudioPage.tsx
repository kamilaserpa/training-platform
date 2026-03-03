import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const ASSETS = '/training-studio/assets/images';

const FEATURES = [
  {
    title: 'Basic Fitness',
    text: 'Please do not re-distribute this template ZIP file on any template collection website. This is not allowed.',
  },
  {
    title: 'New Gym Training',
    text: 'If you wish to support TemplateMo website via PayPal, please feel free to contact us. We appreciate it a lot.',
  },
  {
    title: 'Basic Muscle Course',
    text: 'Credit goes to Pexels website for images and video background used in this HTML template.',
  },
  {
    title: 'Advanced Muscle Course',
    text: 'You may want to browse through Digital Marketing or Corporate HTML CSS templates on our website.',
  },
  {
    title: 'Yoga Training',
    text: 'This template is built on Bootstrap v4.3.1 framework. It is easy to adapt the columns and sections.',
  },
  {
    title: 'Body Building Course',
    text: 'Suspendisse fringilla et nisi et mattis. Curabitur sed finibus nisi. Integer nibh sapien, vehicula et auctor.',
  },
];

const CLASSES = [
  {
    title: 'First Training Class',
    image: `${ASSETS}/training-image-01.jpg`,
    text: 'Phasellus convallis mauris sed elementum vulputate. Donec posuere leo sed dui eleifend hendrerit. Sed suscipit suscipit erat, sed vehicula ligula.',
  },
  {
    title: 'Second Training Class',
    image: `${ASSETS}/training-image-02.jpg`,
    text: 'Integer dapibus, est vel dapibus mattis, sem mauris luctus leo, ac pulvinar quam tortor a velit. Praesent ultrices erat ante, in ultricies augue ultricies faucibus.',
  },
  {
    title: 'Third Training Class',
    image: `${ASSETS}/training-image-03.jpg`,
    text: 'Fusce laoreet malesuada rhoncus. Donec ultricies diam tortor, id auctor neque posuere sit amet. Aliquam pharetra, augue vel cursus porta.',
  },
  {
    title: 'Fourth Training Class',
    image: `${ASSETS}/training-image-04.jpg`,
    text: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean ultrices elementum odio ac tempus.',
  },
];

const SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
type ScheduleDay = (typeof SCHEDULE_DAYS)[number];
const SCHEDULE_ROWS: { class: string; trainer: string; [day: string]: string }[] = [
  { class: 'Fitness Class', monday: '10:00AM - 11:30AM', tuesday: '2:00PM - 3:30PM', trainer: 'William G. Stewart' },
  { class: 'Muscle Training', friday: '10:00AM - 11:30AM', thursday: '2:00PM - 3:30PM', trainer: 'Paul D. Newman' },
  { class: 'Body Building', tuesday: '10:00AM - 11:30AM', monday: '2:00PM - 3:30PM', trainer: 'Boyd C. Harris' },
  { class: 'Yoga Training Class', wednesday: '10:00AM - 11:30AM', friday: '2:00PM - 3:30PM', trainer: 'Hector T. Daigle' },
  { class: 'Advanced Training', thursday: '10:00AM - 11:30AM', wednesday: '2:00PM - 3:30PM', trainer: 'Bret D. Bowers' },
];

const TRAINERS = [
  { role: 'Strength Trainer', name: 'Bret D. Bowers', image: `${ASSETS}/first-trainer.jpg` },
  { role: 'Muscle Trainer', name: 'Hector T. Daigle', image: `${ASSETS}/second-trainer.jpg` },
  { role: 'Power Trainer', name: 'Paul D. Newman', image: `${ASSETS}/third-trainer.jpg` },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function TrainingStudioPage() {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [scheduleDay, setScheduleDay] = useState<ScheduleDay>('monday');
  const [preloaderVisible, setPreloaderVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPreloaderVisible(false), 800);
    return () => clearTimeout(t);
  }, []);

  const primaryMain = theme.palette.primary.main;
  const primaryContrast = theme.palette.primary.contrastText ?? '#fff';
  const textPrimary = theme.palette.text.primary;
  const overlayBg = theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(35,45,57,0.8)';

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Preloader - theme aware */}
      <Box
        className="training-studio-preloader"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: preloaderVisible ? 1 : 0,
          visibility: preloaderVisible ? 'visible' : 'hidden',
          pointerEvents: preloaderVisible ? 'auto' : 'none',
          zIndex: 9999,
          transition: 'opacity 0.25s ease, visibility 0.25s ease',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: primaryMain,
              animation: 'training-studio-dot 2.8s infinite',
              '@keyframes training-studio-dot': {
                '0%, 100%': { transform: 'translateX(0)' },
                '50%': { transform: 'translateX(48px)' },
              },
            }}
          />
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: primaryMain,
                animation: 'training-studio-dots 2.8s infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes training-studio-dots': {
                  '0%, 100%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Banner */}
      <Box
        id="top"
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            width: '100%',
            minHeight: { xs: 320, md: 420 },
            maxHeight: '70vh',
            objectFit: 'cover',
            display: 'block',
          }}
        >
          <source src={`${ASSETS}/gym-video.mp4`} type="video/mp4" />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: overlayBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'common.white', fontWeight: 800, letterSpacing: 1 }}
            >
              work harder, get stronger
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: 'common.white',
                fontWeight: 800,
                mt: 2,
                mb: 2,
                textTransform: 'uppercase',
                '& em': { fontStyle: 'normal', color: primaryMain },
              }}
            >
              easy with our <em>gym</em>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => scrollToSection('features')}
              sx={{ textTransform: 'uppercase', fontWeight: 500 }}
            >
              Become a member
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features */}
      <Box
        id="features"
        component="section"
        sx={{ py: { xs: 6, md: 10 }, mb: 4 }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: textPrimary, textTransform: 'uppercase' }}>
              Choose <Box component="span" sx={{ color: primaryMain }}>Program</Box>
            </Typography>
            <Box
              component="img"
              src={`${ASSETS}/line-dec.png`}
              alt=""
              sx={{ my: 2, display: 'block', mx: 'auto' }}
            />
            <Typography variant="body1" color="text.secondary">
              Training Studio is free CSS template for gyms and fitness centers. You are allowed to use this layout for your business website.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {FEATURES.map((f, i) => (
              <Grid item key={i} xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-start' }}>
                  <Box
                    component="img"
                    src={`${ASSETS}/features-first-icon.png`}
                    alt=""
                    sx={{ width: 56, height: 56, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ color: textPrimary, fontWeight: 600, mb: 0.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {f.text}
                    </Typography>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {}}
                      sx={{
                        color: primaryMain,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        '&:hover': { color: theme.palette.primary.dark },
                      }}
                    >
                      Discover More
                    </Link>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        component="section"
        id="call-to-action"
        sx={{
          py: 10,
          px: 2,
          textAlign: 'center',
          backgroundImage: `url(${ASSETS}/cta-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 3,
          color: 'common.white',
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
            Don’t <Box component="span" sx={{ color: primaryMain }}>think</Box>, begin{' '}
            <Box component="span" sx={{ color: primaryMain }}>today</Box>!
          </Typography>
          <Typography sx={{ mt: 2, mb: 3, opacity: 0.95 }}>
            Ut consectetur, metus sit amet aliquet placerat, enim est ultricies ligula, sit amet dapibus odio augue eget libero.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => scrollToSection('our-classes')}
            sx={{ textTransform: 'uppercase' }}
          >
            Become a member
          </Button>
        </Container>
      </Box>

      {/* Our Classes (Tabs) */}
      <Box
        id="our-classes"
        component="section"
        sx={{ py: { xs: 6, md: 10 }, mb: 4 }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: textPrimary, textTransform: 'uppercase' }}>
              Our <Box component="span" sx={{ color: primaryMain }}>Classes</Box>
            </Typography>
            <Box component="img" src={`${ASSETS}/line-dec.png`} alt="" sx={{ my: 2, mx: 'auto', display: 'block' }} />
            <Typography variant="body1" color="text.secondary">
              Nunc urna sem, laoreet ut metus id, aliquet consequat magna. Sed viverra ipsum dolor, ultricies fermentum massa consequat eu.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Tabs
                value={tabIndex}
                onChange={(_, v) => setTabIndex(v)}
                orientation="vertical"
                sx={{
                  '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', fontSize: '1rem' },
                  '& .Mui-selected': { color: primaryMain },
                }}
              >
                {CLASSES.map((c, i) => (
                  <Tab key={i} label={c.title} icon={<Box component="img" src={`${ASSETS}/tabs-first-icon.png`} alt="" sx={{ width: 24, height: 24 }} />} iconPosition="start" />
                ))}
              </Tabs>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5, textTransform: 'uppercase' }}
              >
                View All Schedules
              </Button>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Box component="img" src={CLASSES[tabIndex].image} alt="" sx={{ width: '100%', borderRadius: 1, mb: 2 }} />
                <Typography variant="h5" sx={{ color: textPrimary, fontWeight: 700, mb: 2 }}>
                  {CLASSES[tabIndex].title}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {CLASSES[tabIndex].text}
                </Typography>
                <Button variant="contained" color="primary" size="small">
                  View Schedule
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Schedule */}
      <Box
        id="schedule"
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          px: 2,
          backgroundImage: `url(${ASSETS}/schedule-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 3,
          color: 'common.white',
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'common.white', textTransform: 'uppercase' }}>
              Classes <Box component="span" sx={{ color: primaryMain }}>Schedule</Box>
            </Typography>
            <Box component="img" src={`${ASSETS}/line-dec.png`} alt="" sx={{ my: 2, mx: 'auto', display: 'block' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Nunc urna sem, laoreet ut metus id, aliquet consequat magna.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 4 }}>
            {SCHEDULE_DAYS.map((day) => (
              <Button
                key={day}
                variant={scheduleDay === day ? 'contained' : 'text'}
                color="primary"
                onClick={() => setScheduleDay(day)}
                sx={{
                  color: scheduleDay === day ? primaryContrast : 'inherit',
                  textTransform: 'capitalize',
                  minWidth: 0,
                  '&:not(:last-of-type)::after': { content: '"/"', ml: 0.5, opacity: 0.7 },
                }}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Button>
            ))}
          </Box>
          <Paper sx={{ overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
            <Table size="medium">
              <TableBody>
                {SCHEDULE_ROWS.map((row, i) => {
                  const time = row[scheduleDay];
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        opacity: time ? 1 : 0.4,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <TableCell sx={{ color: 'common.white', fontWeight: 500 }}>{row.class}</TableCell>
                      <TableCell sx={{ color: 'common.white' }}>{time ?? '-'}</TableCell>
                      <TableCell sx={{ color: 'common.white' }}>{row.trainer}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </Box>

      {/* Trainers */}
      <Box
        id="trainers"
        component="section"
        sx={{ py: { xs: 6, md: 10 }, mb: 4 }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: textPrimary, textTransform: 'uppercase' }}>
              Expert <Box component="span" sx={{ color: primaryMain }}>Trainers</Box>
            </Typography>
            <Box component="img" src={`${ASSETS}/line-dec.png`} alt="" sx={{ my: 2, mx: 'auto', display: 'block' }} />
            <Typography variant="body1" color="text.secondary">
              Nunc urna sem, laoreet ut metus id, aliquet consequat magna.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {TRAINERS.map((t, i) => (
              <Grid item key={i} xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, height: '100%' }}>
                  <Box component="img" src={t.image} alt={t.name} sx={{ width: '100%', borderRadius: 1, mb: 2 }} />
                  <Typography variant="caption" sx={{ color: primaryMain, fontWeight: 500, display: 'block', mb: 0.5 }}>
                    {t.role}
                  </Typography>
                  <Typography variant="h6" sx={{ color: textPrimary, fontWeight: 600, mb: 1 }}>
                    {t.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Bitters cliche tattooed 8-bit distillery mustache. Keytar succulents gluten-free vegan church-key pour-over seitan flannel.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['fa:facebook', 'fa:twitter', 'fa:linkedin', 'fa:behance'].map((icon) => (
                      <Link key={icon} href="#" sx={{ color: textPrimary, '&:hover': { color: primaryMain } }}>
                        <IconifyIcon icon={icon} width={20} />
                      </Link>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact */}
      <Box
        id="contact-us"
        component="section"
        sx={{ py: { xs: 6, md: 10 }, mb: 4 }}
      >
        <Grid container sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
          <Grid item xs={12} md={6}>
            <Box
              component="iframe"
              src="https://maps.google.com/maps?q=Av.+L%C3%BAcio+Costa,+Rio+de+Janeiro+-+RJ,+Brazil&t=&z=13&ie=UTF8&iwloc=&output=embed"
              sx={{ width: '100%', height: 400, border: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                backgroundImage: `url(${ASSETS}/contact-bg.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                minHeight: 400,
              }}
            >
              <Paper component="form" sx={{ p: 3, maxWidth: 480 }}>
                <TextField fullWidth label="Your Name" required sx={{ mb: 2 }} />
                <TextField fullWidth label="Your Email" type="email" required sx={{ mb: 2 }} />
                <TextField fullWidth label="Subject" sx={{ mb: 2 }} />
                <TextField fullWidth label="Message" multiline rows={4} required sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'uppercase' }}>
                  Send Message
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
        <Container>
          <Typography variant="body2" color="text.secondary">
            Copyright © {new Date().getFullYear()} Training Studio — Designed by{' '}
            <Link href="https://templatemo.com" target="_blank" rel="nofollow" color="primary">
              TemplateMo
            </Link>
            <br />
            Distributed by{' '}
            <Link href="https://themewagon.com" target="_blank" rel="nofollow" color="primary">
              ThemeWagon
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link component={RouterLink} to={paths.dashboard} color="primary">
              Voltar ao Training Platform
            </Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
