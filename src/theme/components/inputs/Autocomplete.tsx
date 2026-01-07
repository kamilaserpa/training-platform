import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Autocomplete: Components<Omit<Theme, 'components'>>['MuiAutocomplete'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiInputBase-root': {
        padding: theme.spacing(0, 1.25),
        borderRadius: theme.shape.borderRadius * 4.5,
      },
      '& .MuiInputBase-input': {
        padding: theme.spacing(1),
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 600,
      },
    }),
    paper: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 1.5,
      boxShadow: theme.shadows[8],
      border: `1px solid ${theme.palette.divider}`,
    }),
    option: ({ theme }) => ({
      fontWeight: 500,
      padding: theme.spacing(0.75, 1.25),
      fontSize: theme.typography.body2.fontSize,
      borderRadius: theme.shape.borderRadius * 1.5,
      margin: theme.spacing(0.25, 0.5),
      transition: 'all 0.3s ease-in-out',
      '&:hover': { 
        backgroundColor: theme.palette.info.dark 
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    }),
    listbox: ({ theme }) => ({
      padding: theme.spacing(0.5),
    }),
    noOptions: ({ theme }) => ({
      padding: theme.spacing(1, 1.25),
      fontSize: theme.typography.body2.fontSize,
      color: theme.palette.text.secondary,
    }),
    loading: ({ theme }) => ({
      padding: theme.spacing(1, 1.25),
      fontSize: theme.typography.body2.fontSize,
      color: theme.palette.text.secondary,
    }),
  },
};

export default Autocomplete;