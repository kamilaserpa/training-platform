/**
 * Design System — Paleta baseada em #e02397 (primary pink).
 * Neutras modernas, complementares elegantes, WCAG AA.
 */

// --- Primary (pink #e02397) ---
export const primary = {
  main: '#e02397',
  hover: '#c41d82', // ~10% mais escuro (contraste botão branco)
  active: '#a8186b', // ainda mais escuro para active
  light: '#eb5fac', // 10–15% mais claro
  soft: '#fde6f4', // background suave (HSL 324° ~95% lightness)
};

// --- Neutras modernas ---
export const neutral = {
  dark: '#1f1f1f',
  text: '#333333',
  textLight: '#6b6b6b',
  border: '#ececec',
  background: '#ffffff',
  backgroundSoft: '#fafafa',
};

// --- Brancos e cinzas (compatibilidade) ---
export const white = {
  100: neutral.background,
  200: neutral.backgroundSoft,
  300: '#f4f4f4',
  400: '#eff0f1',
  500: '#e9ebed',
};

export const gray = {
  100: neutral.border,
  500: neutral.textLight,
  900: neutral.text,
};

// --- Complementares elegantes ---
export const accent = {
  /** Lilás suave (secundário sofisticado) */
  main: '#8b7a9e',
  light: '#b8a9c9',
  soft: '#f0ebf4',
};
/** Nude rosado muito leve (complementar) */
export const nude = {
  light: '#faf0f5',
  main: '#e8d4df',
};

// --- Semânticas (acessibilidade: erro em vermelho, não pink) ---
export const blue = {
  500: '#4481EB',
};

export const skyblue = {
  300: '#6AD2FF',
  500: '#04BEFE',
};

export const purple = {
  300: '#6946ff',
  500: '#4318FF',
};

export const indigo = {
  300: '#868CFF',
  500: neutral.dark,
};

export const red = {
  100: '#FEEFEE',
  500: '#EE5D50',
  900: '#E31A1A',
};

export const green = {
  500: '#05CD99',
  900: '#01B574',
};

export const yellow = {
  300: '#FFB547',
  500: '#FFCE20',
};

// Compatibilidade com código que usa pink.*
export const pink = {
  300: primary.light,
  500: primary.main,
  900: primary.active,
};
