import { MenuItem } from 'routes/sitemap';
import { useLocation, useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuth } from '../../../../contexts/AuthContext';
import paths from '../../../../routes/paths';

interface ListItemProps extends MenuItem {
  onItemClick?: () => void;
}

const ListItem = ({ subheader, icon, path, isLogout, onItemClick }: ListItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Determinar se o item está ativo baseado na rota atual
  const isActive = location.pathname === path || 
    (path !== '/' && path && location.pathname.startsWith(path));
  
  // Handler para logout e navegação
  const handleClick = async (e: React.MouseEvent) => {
    if (isLogout) {
      e.preventDefault();
      await signOut();
      navigate(paths.signin);
    }
    // Fechar o drawer em mobile após clicar
    if (onItemClick) {
      onItemClick();
    }
  };

  // Se for logout, não usar Link
  if (isLogout) {
    return (
      <Stack mb={1} alignItems="center" justifyContent="space-between">
        <ListItemButton onClick={handleClick}>
          <ListItemIcon>
            {icon && (
              <IconifyIcon
                icon={icon}
                fontSize="h4.fontSize"
                sx={{
                  color: 'error.main',
                }}
              />
            )}
          </ListItemIcon>
          <ListItemText
            primary={subheader}
            sx={{
              '& .MuiListItemText-primary': {
                color: 'error.main',
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>
        <Box height={36} width={4} borderRadius={10} bgcolor="transparent" />
      </Stack>
    );
  }

  return (
    <Stack mb={1} component={Link} href={path} alignItems="center" justifyContent="space-between">
      <ListItemButton onClick={handleClick}>
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
