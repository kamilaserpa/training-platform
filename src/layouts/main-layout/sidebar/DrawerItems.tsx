import { fontFamily } from 'theme/typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import HorizonLogo from 'assets/images/logo-main.png';
import Image from 'components/base/Image';
import SidebarCard from './SidebarCard';
import sitemap from 'routes/sitemap';
import { useAuth } from '../../../contexts/AuthContext';

interface DrawerItemsProps {
  onItemClick?: () => void;
}

const DrawerItems = ({ onItemClick }: DrawerItemsProps) => {
  const { user, canManageUsers } = useAuth();

  // Filtrar itens do menu baseado na autenticação e permissões
  const filteredSitemap = sitemap.filter((route) => {
    // Verificar se requer permissão para gerenciar usuários
    if (route.requireManageUsers) {
      return canManageUsers; // Mostrar apenas para Owner ou Admin
    }
    
    // Verificar se requer autenticação
    if (route.requireAuth) {
      return !!user; // Mostrar apenas se estiver autenticado
    }
    
    return true; // Mostrar itens públicos sempre
  });

  return (
    <>
      <Stack
        pt={5}
        pb={4.5}
        px={4.5}
        justifyContent="flex-start"
        position="sticky"
        top={0}
        borderBottom={1}
        borderColor="info.main"
        bgcolor="info.lighter"
        zIndex={1000}
      >
        <ButtonBase component={Link} href="/" disableRipple>
          <Image src={HorizonLogo} alt="logo" height={44} width={44} sx={{ mr: 1.75 }} />
          <Typography
            variant="h3"
            letterSpacing={1}
            fontFamily={fontFamily.poppins}
          >
            Training Platform
          </Typography>
        </ButtonBase>
      </Stack>

      <List component="nav" sx={{ mt: 2.5, mb: 10, p: 0, pl: 3 }}>
        {filteredSitemap.map((route) =>
          route.items ? (
            <CollapseListItem key={route.id} {...route} onItemClick={onItemClick} />
          ) : (
            <ListItem key={route.id} {...route} onItemClick={onItemClick} />
          ),
        )}
      </List>

      <Box mt="auto" px={3} pt={15} pb={5}>
        <SidebarCard />
      </Box>
    </>
  );
};

export default DrawerItems;
