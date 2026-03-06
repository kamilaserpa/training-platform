import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const FOCUS_PINK = 'rgba(224, 35, 151, 0.15)';

const FilledInput: Components<Omit<Theme, 'components'>>['MuiFilledInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 8,
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.default,
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.background.default,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.default,
        boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
      },
      '&.Mui-focused::after': {
        borderBottomColor: theme.palette.primary.main,
      },
      '&.Mui-error::after': {
        borderBottomColor: theme.palette.error.main,
      },
    }),
    input: ({ theme }) => ({
      padding: 0,
      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 0.7,
      },
    }),
    sizeSmall: ({ theme }) => ({
      paddingLeft: theme.spacing(1.5),
      paddingTop: theme.spacing(1.25),
      paddingBottom: theme.spacing(1.25),
      minHeight: 48,
    }),
  },
};

export default FilledInput;
