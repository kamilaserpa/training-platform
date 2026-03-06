import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Badge: Components<Omit<Theme, 'components'>>['MuiBadge'] = {
  styleOverrides: {
    root: {},
    badge: ({ theme }) => ({
      top: 9,
      right: 8,
      fontWeight: 600,
    }),
    colorPrimary: ({ theme }) => ({
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    }),
    colorSecondary: ({ theme }) => ({
      backgroundColor: theme.palette.secondary.main,
    }),
    colorError: ({ theme }) => ({
      backgroundColor: theme.palette.error.main,
    }),
  },
};

export default Badge;
