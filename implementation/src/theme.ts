// Material-inspired color palette and spacing for Fretboard-King
export const theme = {
  primary: '#1976d2',
  secondary: '#4caf50',
  error: '#e53935',
  background: '#181a20',
  surface: '#23272f',
  onPrimary: '#fff',
  onSecondary: '#fff',
  onSurface: '#e0e0e0',
  border: '#333a',
  borderRadius: 12,
  spacing: (factor: number) => `${factor * 8}px`,
  shadow: '0 4px 24px #0006',
  font: {
    family: `'Inter', 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
    weight: 400,
    headingWeight: 600,
  },
};
