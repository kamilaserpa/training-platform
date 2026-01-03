import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';

const App = lazy(() => import('../App'));
const MainLayout = lazy(() => import('../layouts/main-layout'));
const AuthLayout = lazy(() => import('../layouts/auth-layout'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const TreinoDetalhesForm = lazy(() => import('../pages/treinos/TreinoDetalhesForm'));

// Novas páginas adicionadas
const Semanas = lazy(() => import('../pages/semanas/Semanas'));
const Treinos = lazy(() => import('../pages/treinos/Treinos'));
const Configuracoes = lazy(() => import('../pages/configuracoes/Configuracoes'));
const Exercicios = lazy(() => import('../pages/exercicios/Exercicios'));

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
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: paths.semanas,
            element: <Semanas />,
          },
          {
            path: paths.treinos,
            element: <Treinos />,
          },
          {
            path: paths.configuracoes,
            element: <Configuracoes />,
          },
          {
            path: paths.exercicios,
            element: <Exercicios />,
          },
          {
            path: paths.treinoDetalhesForm,
            element: <TreinoDetalhesForm />,
          },
        ],
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

const router = createBrowserRouter(routes, { basename: '/horizon' });

export default router;
