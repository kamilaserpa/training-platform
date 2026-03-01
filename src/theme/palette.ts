import { PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import {
  gray,
  red,
  green,
  blue,
  yellow,
  skyblue,
  purple,
  indigo,
  white,
  primary,
  neutral,
  accent,
  nude,
} from './colors';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    neutral?: PaletteColorOptions;
    transparent?: {
      success: PaletteColorOptions;
      warning: PaletteColorOptions;
      error: PaletteColorOptions;
    };
    gradients?: {
      primary: PaletteColorOptions;
      secondary?: PaletteColorOptions;
    };
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
    state?: string;
    hover?: string;
    active?: string;
    soft?: string;
  }
  interface Palette {
    neutral: PaletteColor;
    gradients: {
      primary: PaletteColor;
      secondary: PaletteColor;
    };
    transparent: {
      success: PaletteColor;
      warning: PaletteColor;
      error: PaletteColor;
    };
  }
  interface PaletteColor {
    lighter?: string;
    darker?: string;
    state?: string;
    hover?: string;
    active?: string;
    soft?: string;
  }
}

const palette: PaletteOptions = {
  neutral: {
    light: gray[100],
    main: gray[500],
    dark: gray[900],
  },
  primary: {
    light: primary.light,
    lighter: primary.soft,
    main: primary.main,
    dark: primary.active,
    hover: primary.hover,
    active: primary.active,
    soft: primary.soft,
    contrastText: '#ffffff',
  },
  secondary: {
    light: accent.light,
    main: accent.main,
    dark: accent.main,
    contrastText: '#ffffff',
  },
  info: {
    lighter: white[100],
    light: white[200],
    main: white[300],
    dark: white[400],
    darker: white[500],
  },
  success: {
    main: green[500],
    dark: green[900],
  },
  warning: {
    light: yellow[300],
    main: yellow[500],
  },
  error: {
    light: red[100],
    main: red[500],
    dark: red[900],
  },
  text: {
    primary: neutral.text,
    secondary: neutral.textLight,
    disabled: gray[500],
  },
  background: {
    default: neutral.backgroundSoft,
    paper: neutral.background,
  },
  divider: neutral.border,
  gradients: {
    primary: {
      main: primary.main,
      state: primary.light,
    },
    secondary: {
      main: accent.main,
      state: accent.light,
    },
  },
};

export default palette;
