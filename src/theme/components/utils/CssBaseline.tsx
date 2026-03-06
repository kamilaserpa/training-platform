import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import scrollbar from 'theme/styles/scrollbar';
import echart from 'theme/styles/echart';

const CssBaseline: Components<Omit<Theme, 'components'>>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    '*, *::before, *::after': {
      margin: 0,
      padding: 0,
    },
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      fontVariantLigatures: 'none',
      backgroundColor: theme.palette.background?.default ?? theme.palette.info.main,
      ...scrollbar(theme),
    },
    /* Focus visível para acessibilidade */
    'button:focus-visible, a:focus-visible, [role="button"]:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    ...echart(),
  }),
};

export default CssBaseline;
