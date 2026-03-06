import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const BORDER_NEUTRAL = '#ececec';
const FOCUS_PINK = 'rgba(224, 35, 151, 0.2)';

const InputBase: Components<Omit<Theme, 'components'>>['MuiInputBase'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      border: '1px solid',
      borderColor: BORDER_NEUTRAL,
      borderRadius: 8,
      backgroundColor: theme.palette.background.paper,
      fontSize: theme.typography.subtitle2.fontSize,
      color: theme.palette.text.primary,
      padding: theme.spacing(1.5, 2),
      letterSpacing: 0.5,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',

      '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${FOCUS_PINK}`,
      },

      '&.Mui-error': {
        borderColor: theme.palette.error.main,
      },

      '&:before, &:after': {
        display: 'none',
      },
    }),
    colorSecondary: ({ theme }) => ({
      backgroundColor: theme.palette.info.dark + ' !important',
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(1.25, 1.5),
      paddingLeft: theme.spacing(1.75) + ' !important',
      fontSize: theme.typography.caption.fontSize,
      minHeight: 44,
    }),
    input: ({ theme }) => ({
      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 0.7,
      },
    }),
    inputSizeSmall: ({ theme }) => ({
      marginBottom: theme.spacing(0.2),
    }),
  },
};

export default InputBase;
