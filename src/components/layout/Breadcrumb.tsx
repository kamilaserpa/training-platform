import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';

/**
 * Mapeamento de rotas para labels legíveis
 */
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'semanas': 'Semanas',
  'treinos': 'Treinos',
  'exercicios': 'Exercícios',
  'configuracoes': 'Parâmetros da Semana',
  'novo': 'Novo',
  'editar': 'Editar',
  'pages': '', // Ignorar 'pages' no breadcrumb
};

export default function Breadcrumb() {
  const location = useLocation();
  
  // Dividir o pathname e filtrar partes vazias
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'pages');

  // Se estiver na home, não mostrar breadcrumb
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {/* Link para Home */}
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Dashboard
        </Link>

        {/* Breadcrumbs dinâmicos */}
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Buscar label customizado no sessionStorage (genérico para qualquer ID)
          const customLabel = sessionStorage.getItem(`breadcrumb_${value}`);
          const label = customLabel || routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

          // Se for o último item, mostrar como texto (sem link)
          return last ? (
            <Typography
              key={to}
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              component={RouterLink}
              to={to}
              underline="hover"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
