import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 3.25,
      color: theme.palette.text.primary,
    }),
    input: ({ theme }) => ({
      padding: 0,
      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 0.7,
      },
    }),
    sizeSmall: ({ theme }) => ({
      paddingLeft: theme.spacing(1.25),
      paddingRight: theme.spacing(1.25),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    }),
  },
};

export default OutlinedInput;
