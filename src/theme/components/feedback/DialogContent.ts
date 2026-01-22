import type { Components, Theme } from '@mui/material';

const DialogContent: Components<Theme>['MuiDialogContent'] = {
  styleOverrides: {
    root: {
      padding: 0,
    },
  },
};

export default DialogContent;
