import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Select: Components<Omit<Theme, 'components'>>['MuiSelect'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 4.5,
      '&.MuiInputBase-root': {
        border: 'none',
        '& .MuiBox-root': {
          minWidth: 20,
        },
      },
    }),
    select: ({ theme }) => ({
      padding: 0,
      paddingRight: `${theme.spacing(3)} !important`,
      backgroundColor: 'transparent !important',
      fontSize: theme.typography.body2.fontSize,
      color: theme.palette.text.primary,
      fontWeight: 600,
      border: 'none',
      '&.MuiInputBase-inputSizeSmall': {
        padding: 0,
        paddingRight: `${theme.spacing(3)} !important`,
      },
    }),
    icon: ({ theme }) => ({
      color: theme.palette.text.disabled,
    }),
  },
};

export default Select;
