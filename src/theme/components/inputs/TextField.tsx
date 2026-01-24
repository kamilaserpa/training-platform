import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const TextField: Components<Omit<Theme, 'components'>>['MuiTextField'] = {
  defaultProps: {
    variant: 'outlined',
  },
};

export default TextField;
