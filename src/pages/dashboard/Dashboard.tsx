import Grid from '@mui/material/Grid';
import { Container, Typography, Box } from '@mui/material';

// Novos componentes da plataforma de treinos
import CurrentWeek from '../../components/dashboard/CurrentWeek';
import WeekWorkouts from '../../components/dashboard/WeekWorkouts';
import RecentWeeks from '../../components/dashboard/RecentWeeks';
import AlertsAndPendencies from '../../components/dashboard/AlertsAndPendencies';

// Componentes originais do template (mantidos para referência)
import Calendar from 'components/sections/dashboard/calendar';
import Analytics from 'components/sections/dashboard/analytics';
import TotalSpent from 'components/sections/dashboard/total-spent';
import CardSecurity from 'components/sections/dashboard/card-security';
import ComplexTable from 'components/sections/dashboard/complex-table';
import PiChart from 'components/sections/dashboard/your-pi-chart';
import History from 'components/sections/dashboard/history';
import Revenue from 'components/sections/dashboard/revenue';
import Tasks from 'components/sections/dashboard/tasks';
import TeamMembers from 'components/sections/dashboard/team-members';
import DailyTraffic from 'components/sections/dashboard/daily-traffic';
import TrendingNFTs from 'components/sections/dashboard/trending-nfts';
import BusinessDesign from 'components/sections/dashboard/business-design';

const Dashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Hero Section - Semana Atual */}
        <Grid item xs={12}>
          <CurrentWeek />
        </Grid>

        {/* Treinos da Semana Atual */}
        <Grid item xs={12}>
          <WeekWorkouts />
        </Grid>

        {/* Semanas Recentes */}
        <Grid item xs={12}>
          <RecentWeeks />
        </Grid>

        {/* Alertas & Pendências */}
        <Grid item xs={12}>
          <AlertsAndPendencies />
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
    </Container>
  );
};

export default Dashboard;
