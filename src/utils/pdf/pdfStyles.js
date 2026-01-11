// Estilos e configurações padrão para PDFs
export const pdfConfig = {
  format: 'a4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    headerBg: '#f5f5f5'
  },
  fonts: {
    title: 16,
    subtitle: 14,
    heading: 12,
    body: 10,
    small: 9
  }
}

export const tableStyles = {
  theme: 'grid',
  headStyles: {
    fillColor: [25, 118, 210], // primary color
    textColor: 255,
    fontStyle: 'bold',
    fontSize: 10,
    halign: 'left'
  },
  bodyStyles: {
    fontSize: 9,
    textColor: [51, 51, 51],
    cellPadding: 3
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  },
  columnStyles: {
    0: { cellWidth: 'auto', fontStyle: 'bold' }
  },
  margin: { top: 10 }
}

export const blockTableStyles = {
  theme: 'grid',
  headStyles: {
    fillColor: [25, 118, 210], // primary blue
    textColor: 255,
    fontStyle: 'bold',
    fontSize: 9,
    halign: 'left'
  },
  bodyStyles: {
    fontSize: 8,
    textColor: [51, 51, 51],
    cellPadding: 2
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245] // light gray
  },
  margin: { top: 5, bottom: 5 }
}
