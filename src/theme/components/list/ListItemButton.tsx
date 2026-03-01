import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const ListItemButton: Components<Omit<Theme, 'components'>>['MuiListItemButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.secondary,
      padding: theme.spacing(1.25, 1.5),
      borderRadius: 8,
      minHeight: 48,
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: (theme.palette.primary as { soft?: string }).soft ?? 'rgba(224, 35, 151, 0.08)',
      },
      '&.Mui-selected': {
        backgroundColor: (theme.palette.primary as { soft?: string }).soft ?? 'rgba(224, 35, 151, 0.12)',
        color: theme.palette.primary.main,
      },
    }),
  },
};

export default ListItemButton;
