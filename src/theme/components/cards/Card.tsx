import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import customShadows from 'theme/shadows';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
      borderRadius: 8,
      border: '1px solid',
      borderColor: theme.palette.divider || '#ececec',
      boxShadow: 'none',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      '&:hover': {
        boxShadow: customShadows[0],
      },
    }),
  },
};

export default Card;
