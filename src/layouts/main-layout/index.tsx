import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Sidebar from 'layouts/main-layout/sidebar';
import { PropsWithChildren, useState } from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { WeeksSelectionProvider } from '../../contexts/WeeksSelectionContext';
import Footer from './footer';
import Topbar from './topbar';

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  return (
    <WeeksSelectionProvider>
      <Stack width={1} minHeight="100vh">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} setIsClosing={setIsClosing} />
        <Stack
          component="main"
          direction="column"
          flexGrow={1}
          width={{ xs: 1, lg: 'calc(100% - 290px)' }}
          sx={{
            backgroundColor: 'info.main',
            minHeight: '100vh',
          }}
        >
          <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
          <Container
            maxWidth="xl"
            sx={{
              flexGrow: 1,
              py: 4,
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: '1400px !important',
            }}
          >
            <Breadcrumb />
            <Box component="section" sx={{ pb: 4 }}>
              {children}
            </Box>
          </Container>
          <Footer />
        </Stack>
      </Stack>
    </WeeksSelectionProvider>
  );
};

export default MainLayout;
