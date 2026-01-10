import { ReactNode } from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface PageWrapperProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Componente wrapper para padronizar o layout das páginas internas
 * Fornece título, subtítulo, ações e espaçamento consistente
 */
export default function PageWrapper({
  title,
  subtitle,
  actions,
  children,
}: PageWrapperProps) {
  return (
    <Box>
      {/* Header da página */}
      {(title || actions) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            {title && (
              <Typography
                variant="h4"
                fontWeight="700"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Stack>
      )}

      {/* Conteúdo da página */}
      <Box>{children}</Box>
    </Box>
  );
}
