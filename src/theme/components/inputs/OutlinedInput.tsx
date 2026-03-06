import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const BORDER_NEUTRAL = '#ececec';
const FOCUS_PINK = 'rgba(224, 35, 151, 0.35)';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 8,
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: BORDER_NEUTRAL,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${FOCUS_PINK}`,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
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
      paddingRight: theme.spacing(1.5),
      paddingTop: theme.spacing(1.25),
      paddingBottom: theme.spacing(1.25),
    }),
  },
};

export default OutlinedInput;
