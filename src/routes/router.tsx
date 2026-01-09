import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PrivateRoute from '../components/navigation/PrivateRoute';

const App = lazy(() => import('../App'));
const MainLayout = lazy(() => import('../layouts/main-layout'));
const AuthLayout = lazy(() => import('../layouts/auth-layout'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const TreinoForm = lazy(() => import('../pages/treinos/TreinoForm'));
const TreinoPublico = lazy(() => import('../pages/treinos/TreinoPublico'));

// Novas páginas adicionadas
const Semanas = lazy(() => import('../pages/semanas/Semanas'));
const SemanasRefactored = lazy(() => import('../pages/semanas/SemanasRefactored'));
const Treinos = lazy(() => import('../pages/treinos/Treinos'));
const Configuracoes = lazy(() => import('../pages/configuracoes/Configuracoes'));
const Exercicios = lazy(() => import('../pages/exercicios/Exercicios'));
const Usuarios = lazy(() => import('../pages/usuarios/Usuarios'));
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
          // Usuários (Owner e Admin)
          // ==========================================
          {
            path: paths.usuarios,
            element: <Usuarios />,
          },

          // ==========================================
          // Configurações
          // ==========================================
          {
            path: paths.configuracoes,
            element: <Configuracoes />,
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
            path: paths.signin,
            element: <SignIn />,
          },
          {
            path: paths.signup,
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

const router = createBrowserRouter(routes);

export default router;
