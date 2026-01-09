import { MenuItem } from 'routes/sitemap';
import { useLocation } from 'react-router-dom';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';

const ListItem = ({ subheader, icon, path }: MenuItem) => {
  const location = useLocation();
  
  // Determinar se o item está ativo baseado na rota atual
  const isActive = location.pathname === path || 
    (path !== '/' && location.pathname.startsWith(path || ''));
  
  return (
    <Stack mb={1} component={Link} href={path} alignItems="center" justifyContent="space-between">
      <ListItemButton>
        <ListItemIcon>
          {icon && (
            <IconifyIcon
              icon={icon}
              fontSize="h4.fontSize"
              sx={{
                color: isActive ? 'primary.main' : null,
              }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          primary={subheader}
          sx={{
            '& .MuiListItemText-primary': {
              color: isActive ? 'primary.main' : null,
              fontWeight: isActive ? 600 : 500,
            },
          }}
        />
      </ListItemButton>

      <Box
        height={36}
        width={4}
        borderRadius={10}
        bgcolor={isActive ? 'primary.main' : 'transparent'}
      />
    </Stack>
  );
};

export default ListItem;
