import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas, garantindo que apenas usuários autenticados tenham acesso.
 * Se o usuário não estiver autenticado, redireciona para a página de login.
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Enquanto está carregando, mostra um spinner
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, redireciona para login salvando a URL atual
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
}
