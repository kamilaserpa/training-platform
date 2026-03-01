import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Chip: Components<Omit<Theme, 'components'>>['MuiChip'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      margin: 0,
      fontWeight: 600,
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      borderRadius: 8,
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    }),
    sizeSmall: ({ theme }) => ({
      height: 28,
      padding: theme.spacing(0, 1.25),
      fontSize: theme.typography.caption.fontSize,
    }),
    sizeMedium: ({ theme }) => ({
      height: 32,
      padding: theme.spacing(0, 1.5),
      fontSize: theme.typography.body2.fontSize,
      minHeight: 32,
    }),
    colorPrimary: ({ theme }) => ({
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    }),
    colorSuccess: ({ theme }) => ({
      backgroundColor: theme.palette.success.main,
    }),
    colorWarning: ({ theme }) => ({
      backgroundColor: theme.palette.warning.main,
    }),
    colorError: ({ theme }) => ({
      backgroundColor: theme.palette.error.main,
    }),
    colorSecondary: ({ theme }) => ({
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.getContrastText(theme.palette.secondary.main),
    }),
    colorInfo: ({ theme }) => ({
      backgroundColor: theme.palette.info.main,
      color: theme.palette.text.primary,
    }),
    outlined: ({ theme }) => ({
      borderColor: theme.palette.divider || '#ececec',
    }),
    outlinedPrimary: ({ theme }) => ({
      backgroundColor: theme.palette.primary.soft ?? 'transparent',
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.light,
    }),
    outlinedSecondary: ({ theme }) => ({
      backgroundColor: 'transparent',
      color: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.light,
    }),
    iconSmall: {
      width: 12,
      margin: '0 !important',
    },
    iconMedium: {
      width: 16,
      margin: '0 !important',
    },
    labelSmall: {
      padding: 0,
      textTransform: 'capitalize',
    },
    labelMedium: {
      padding: 0,
      textTransform: 'capitalize',
    },
  },
};

export default Chip;
