import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import customShadows from 'theme/shadows';

const Paper: Components<Omit<Theme, 'components'>>['MuiPaper'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3.5),
      backgroundColor: theme.palette.background.paper,
      borderRadius: 8,
      border: '1px solid',
      borderColor: theme.palette.divider || '#ececec',
      boxShadow: 'none',
      transition: 'box-shadow 0.2s ease',

      '&.MuiMenu-paper': {
        padding: 0,
        boxShadow: customShadows[2],
        borderRadius: 8,
      },

      '&.MuiDialog-paper': {
        padding: 0,
      },
    }),
  },
};

export default Paper;
