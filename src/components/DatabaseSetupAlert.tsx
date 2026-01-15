import React from 'react';
import { Alert, AlertTitle, Button, Box, Typography, Paper, Divider, Stack } from '@mui/material';
import { Storage as DatabaseIcon, FileCopy as CopyIcon } from '@mui/icons-material';

interface DatabaseSetupAlertProps {
  error: string;
  onRetry?: () => void;
}

export function DatabaseSetupAlert({ error, onRetry }: DatabaseSetupAlertProps) {
  const isRLSError = error.includes('42501') || error.includes('row-level security');
  const isAuthError = error.includes('Invalid Refresh Token') || error.includes('Sessão expirada');

  const copyScript = () => {
    const script = `-- Execute este script no SQL Editor do Supabase
-- para corrigir as políticas RLS da tabela training_weeks

-- 1. Habilitar RLS na tabela training_weeks
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para training_weeks
CREATE POLICY "Permitir leitura de training_weeks" 
ON training_weeks FOR SELECT 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Permitir inserção de training_weeks" 
ON training_weeks FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Permitir atualização de training_weeks" 
ON training_weeks FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Permitir exclusão de training_weeks" 
ON training_weeks FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);`;

    navigator.clipboard.writeText(script);
    alert('Script copiado para área de transferência!');
  };

  const clearSession = () => {
    const script = `// Execute no console do navegador (F12)
Object.keys(localStorage).filter(k => k.includes('supabase')).forEach(k => localStorage.removeItem(k));
Object.keys(sessionStorage).filter(k => k.includes('supabase')).forEach(k => sessionStorage.removeItem(k));
location.reload();`;

    navigator.clipboard.writeText(script);
    alert('Script de limpeza copiado! Cole no console do navegador (F12)');
  };

  if (isRLSError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>🔒 Erro de Configuração do Banco</AlertTitle>
        <Typography gutterBottom>
          A tabela <code>training_weeks</code> não tem as políticas RLS configuradas.
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            📋 <strong>Passos para correção:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Acesse o <strong>Supabase Dashboard</strong>
            <br />
            2. Vá para <strong>SQL Editor</strong>
            <br />
            3. Cole e execute o script abaixo
            <br />
            4. Volte aqui e clique em "Tentar Novamente"
          </Typography>
        </Paper>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CopyIcon />} onClick={copyScript} size="small">
            Copiar Script SQL
          </Button>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} size="small">
              Tentar Novamente
            </Button>
          )}
        </Stack>
      </Alert>
    );
  }

  if (isAuthError) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>🔐 Sessão Expirada</AlertTitle>
        <Typography gutterBottom>Sua sessão do Supabase expirou ou está corrompida.</Typography>

        <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            🧹 <strong>Solução rápida:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Abra o <strong>Console do Navegador</strong> (F12)
            <br />
            2. Cole e execute o script abaixo
            <br />
            3. A página será recarregada automaticamente
          </Typography>
        </Paper>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CopyIcon />} onClick={clearSession} size="small">
            Copiar Script de Limpeza
          </Button>
          {onRetry && (
            <Button variant="contained" onClick={() => window.location.reload()} size="small">
              Recarregar Página
            </Button>
          )}
        </Stack>
      </Alert>
    );
  }

  // Erro genérico
  return (
    <Alert severity="error" sx={{ mb: 3 }}>
      <AlertTitle>❌ Erro</AlertTitle>
      <Typography>{error}</Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry} size="small" sx={{ mt: 2 }}>
          Tentar Novamente
        </Button>
      )}
    </Alert>
  );
}
