import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const primaryHover = '#c41d82';
const primaryActive = '#a8186b';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.primary,
      borderRadius: 8,
      textTransform: 'initial',
      transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
    }),
    text: ({ theme }) => ({
      color: theme.palette.text.secondary,
      backgroundColor: 'transparent !important',
      fontWeight: 500,
    }),
    containedPrimary: ({ theme }) => ({
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      boxShadow: '0 2px 8px rgba(224, 35, 151, 0.25)',
      '&:hover': {
        backgroundColor: primaryHover,
        boxShadow: '0 4px 12px rgba(224, 35, 151, 0.3)',
      },
      '&:active': {
        backgroundColor: primaryActive,
      },
    }),
    containedSecondary: ({ theme }) => ({
      color: theme.palette.secondary.contrastText,
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    }),
    containedInfo: ({ theme }) => ({
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.info.main,
      '&:hover': {
        backgroundColor: theme.palette.info.dark,
      },
    }),
    outlined: ({ theme }) => ({
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.soft ?? 'rgba(224, 35, 151, 0.08)',
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    }),
    outlinedSecondary: ({ theme }) => ({
      color: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main + '14',
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
      },
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.25, 3),
      fontSize: theme.typography.body1.fontSize,
      minHeight: 48,
    }),
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(1, 2.75),
      fontSize: theme.typography.body1.fontSize,
      minHeight: 44,
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(0.75, 2.35),
      fontSize: theme.typography.caption.fontSize,
      fontWeight: 600,
      minHeight: 36,
    }),
    startIcon: {
      marginRight: 6,
    },
    endIcon: {
      marginLeft: 6,
    },
  },
};

export default Button;
