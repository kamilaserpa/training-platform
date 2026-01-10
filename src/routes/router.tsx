import { Suspense, lazy } from 'react';
import { Outlet, createHashRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PrivateRoute from '../components/navigation/PrivateRoute';

const basename = import.meta.env.PROD ? '/training-platform' : '';

const App = lazy(() => import('../App'));
const MainLayout = lazy(() => import('../layouts/main-layout'));
const AuthLayout = lazy(() => import('../layouts/auth-layout'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const TreinoForm = lazy(() => import('../pages/treinos/TreinoForm.jsx'));
const TreinoPublico = lazy(() => import('../pages/treinos/TreinoPublico.jsx'));

// Novas páginas adicionadas
const Semanas = lazy(() => import('../pages/semanas/Semanas'));
const SemanasRefactored = lazy(() => import('../pages/semanas/SemanasRefactored'));
const Treinos = lazy(() => import('../pages/treinos/Treinos'));
const Configuracoes = lazy(() => import('../pages/configuracoes/Configuracoes'));
const Exercicios = lazy(() => import('../pages/exercicios/Exercicios'));
const Usuarios = lazy(() => import('../pages/usuarios/Usuarios'));
const Perfil = lazy(() => import('../pages/perfil/Perfil'));
const ThemePlayground = lazy(() => import('../pages/ThemePlayground'));

const SignIn = lazy(() => import('../pages/authentication/SignIn'));
const SignUp = lazy(() => import('../pages/authentication/SignUp'));
const Page404 = lazy(() => import('../pages/errors/Page404'));

import PageLoader from 'components/loading/PageLoader';
import Progress from 'components/loading/Progress';

export const routes = [
  {
    element: (
      <Suspense fallback={<Progress />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: rootPaths.root,
        element: (
          <PrivateRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </PrivateRoute>
        ),
        children: [
          // ==========================================
          // Dashboard
          // ==========================================
          {
            index: true,
            element: <Dashboard />,
          },

          // ==========================================
          // Treinos
          // ==========================================
          {
            path: paths.treinos,
            element: <Treinos />,
          },
          {
            path: paths.treinoNovo,
            element: <TreinoForm />,
          },
          {
            path: `${paths.treinos}/:id/editar`,
            element: <TreinoForm />,
          },

          // ==========================================
          // Exercícios
          // ==========================================
          {
            path: paths.exercicios,
            element: <Exercicios />,
          },

          // ==========================================
          // Semanas
          // ==========================================
          {
            path: paths.semanas,
            element: <SemanasRefactored />,
          },

          // ==========================================
          // Parâmetros da Semana
          // ==========================================
          {
            path: paths.configuracoes,
            element: <Configuracoes />,
          },

          // ==========================================
          // Usuários (Owner e Admin)
          // ==========================================
          {
            path: paths.usuarios,
            element: <Usuarios />,
          },

          // ==========================================
          // Perfil
          // ==========================================
          {
            path: paths.perfil,
            element: <Perfil />,
          },

          // ==========================================
          // Desenvolvimento
          // ==========================================
          {
            path: paths.themePlayground,
            element: <ThemePlayground />,
          },
        ],
      },
      {
        // Rota pública para visualização de treinos
        path: '/treino-publico/:token',
        element: <TreinoPublico />,
      },
      {
        path: rootPaths.authRoot,
        element: <AuthLayout />,
        children: [
          {
            path: 'sign-in',
            element: <SignIn />,
          },
          {
            path: 'sign-up',
            element: <SignUp />,
          },
        ],
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

const router = createHashRouter(routes);

export default router;
