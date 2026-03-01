import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const IconButton: Components<Omit<Theme, 'components'>>['MuiIconButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
      marginLeft: 0,
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.primary.soft ?? 'rgba(224, 35, 151, 0.08)',
        color: theme.palette.primary.main,
      },
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.25),
      fontSize: theme.typography.h3.fontSize,
      minWidth: 48,
      minHeight: 48,
    }),
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(1),
      fontSize: theme.typography.h4.fontSize,
      minWidth: 44,
      minHeight: 44,
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(0.75),
      fontSize: theme.typography.h6.fontSize,
      minWidth: 36,
      minHeight: 36,
    }),
    colorPrimary: ({ theme }) => ({
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.soft,
        color: theme.palette.primary.dark,
      },
    }),
  },
};

export default IconButton;
