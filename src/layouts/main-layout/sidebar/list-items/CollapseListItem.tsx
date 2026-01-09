import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuItem } from 'routes/sitemap';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconifyIcon from 'components/base/IconifyIcon';

const CollapseListItem = ({ subheader, items, icon }: MenuItem) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  // Verificar se algum item filho está ativo
  const isAnyChildActive = items?.some(item => location.pathname === item.path);
  const isActive = isAnyChildActive;
  
  // Abrir automaticamente se algum filho estiver ativo
  useEffect(() => {
    if (isAnyChildActive) {
      setOpen(true);
    }
  }, [isAnyChildActive]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ pb: 1.5 }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          {icon && (
            <IconifyIcon
              icon={icon}
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
            },
          }}
        />
        <IconifyIcon
          icon="iconamoon:arrow-down-2-duotone"
          sx={{
            color: isActive ? 'primary.main' : 'text.disabled',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items?.map((route) => {
            const isItemActive = location.pathname === route.path;
            return (
              <ListItemButton
                key={route.pathName}
                component={Link}
                href={route.path}
                sx={{ ml: 2.25, bgcolor: isItemActive ? 'info.main' : null }}
              >
                <ListItemText
                  primary={route.pathName}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isItemActive ? 'primary.main' : 'text.disabled',
                      fontWeight: isItemActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
};

export default CollapseListItem;
