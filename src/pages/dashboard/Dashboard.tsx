import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState } from 'react';

// Alertas e Notificações
import { DevModeAlert } from '../../components/DevModeAlert';

// Novos componentes da plataforma de treinos
import AlertsAndPendencies from '../../components/dashboard/AlertsAndPendencies';
import CurrentWeek from '../../components/dashboard/CurrentWeek';
import RecentWeeks from '../../components/dashboard/RecentWeeks';
import WeekWorkouts from '../../components/dashboard/WeekWorkouts';
import ExportModal from '../../components/export/ExportModal';

// Hook para dados de exportação
import { useExportData } from '../../hooks/useExportData';

// Componentes originais do template (mantidos para referência)
import Calendar from 'components/sections/dashboard/calendar';
import Shortcuts from 'src/components/sections/dashboard/shortcuts';

const Dashboard = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { weeks, loading: loadingExportData } = useExportData();

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 0, sm: 3 } }}>
      {/* Alertas e Notificações */}
      <DevModeAlert />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* Hero Section - Semana Atual */}
        <Grid item xs={12}>
          <CurrentWeek />
        </Grid>

        <Grid item xs={12}>
          <Shortcuts />
        </Grid>

        {/* Treinos da Semana Atual */}
        <Grid item xs={12}>
          <WeekWorkouts />
        </Grid>

        {/* Semanas Recentes */}
        <Grid item xs={12}>
          <RecentWeeks />
        </Grid>

        {/* Alertas e Notificações */}
        <Grid item xs={12}>
          <AlertsAndPendencies />
        </Grid>

        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Calendar />
        </Grid>

        {/* Componentes originais do template (comentados para futuro uso) */}
        {/*
        <Grid item xs={12}>
          <Analytics />
        </Grid>
        <Grid item xs={12} md={6}>
          <TotalSpent />
        </Grid>
        <Grid item xs={12} md={6}>
          <Revenue />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <CardSecurity />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Tasks />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <DailyTraffic />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <PiChart />
        </Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <TrendingNFTs />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <History />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Calendar />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <BusinessDesign />
        </Grid>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <TeamMembers />
        </Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <ComplexTable />
        </Grid>
        */}
      </Grid>

      {/* Modal de Exportação */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        weeks={weeks}
      />
    </Container>
  );
};

export default Dashboard;
