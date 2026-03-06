/**
 * Sombras suaves e modernas — estética elegante, não agressiva.
 * Leve toque pink para consistência com a identidade.
 */

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: string[];
  }
  interface ThemeOptions {
    customShadows?: string[];
  }
}

const customShadows = [
  '0 2px 8px rgba(224, 35, 151, 0.06)', // cards, hover suave
  '0 4px 16px rgba(224, 35, 151, 0.08)', // elevação média
  '0 8px 24px rgba(31, 31, 31, 0.08)', // modais/dropdowns
  '0 2px 10px rgba(10, 10, 10, 0.06)', // botões (discreta)
];

export default customShadows;
