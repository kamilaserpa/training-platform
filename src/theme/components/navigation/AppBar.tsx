import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const AppBar: Components<Omit<Theme, 'components'>>['MuiAppBar'] = {
  styleOverrides: {
    colorPrimary: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: 0,
      boxShadow: '0 1px 0 ' + (theme.palette.divider || '#ececec'),
    }),
  },
};

export default AppBar;
