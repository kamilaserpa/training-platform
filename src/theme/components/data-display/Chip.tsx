import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Chip: Components<Omit<Theme, 'components'>>['MuiChip'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      margin: 0,
      fontWeight: 700,
      backgroundColor: theme.palette.info.main,
      color: theme.palette.text.primary,
    }),
    sizeSmall: ({ theme }) => ({
      height: 24,
      padding: theme.spacing(0, 1),
      fontSize: theme.typography.caption.fontSize,
    }),
    sizeMedium: ({ theme }) => ({
      height: 28,
      padding: theme.spacing(0, 1.25),
      fontSize: theme.typography.body2.fontSize,
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
    colorInfo: ({ theme }) => ({
      backgroundColor: theme.palette.info.main,
      color: theme.palette.text.primary,
    }),
    outlinedPrimary: ({ theme }) => ({
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      borderColor: 'rgba(67, 24, 255, 0.7)',
    }),
    outlinedSecondary: ({ theme }) => ({
      backgroundColor: 'transparent',
      color: theme.palette.secondary.main,
      borderColor: 'rgba(4, 190, 254, 0.7)',
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
