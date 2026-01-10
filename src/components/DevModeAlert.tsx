import { Alert, Box } from '@mui/material';
import { useMock } from '../lib/supabase';

export function DevModeAlert() {
  if (!useMock) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="info" variant="filled">
        <strong>🛠️ MODO DESENVOLVIMENTO</strong> - Usando dados simulados (mock). 
        Configure credenciais reais do Supabase no arquivo .env para persistir dados.
      </Alert>
    </Box>
  );
}