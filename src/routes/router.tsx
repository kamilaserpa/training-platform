import PageLoader from 'components/loading/PageLoader';
import Progress from 'components/loading/Progress';
import { Suspense, lazy } from 'react';
import { Outlet, createHashRouter } from 'react-router-dom';
import PrivateRoute from '../components/navigation/PrivateRoute';
import paths, { rootPaths } from './paths';

// HashRouter não precisa de basename - o base path é controlado pelo Vite
// e afeta apenas os assets (JS, CSS, imagens)

const App = lazy(() => import('../App'));
const MainLayout = lazy(() => import('../layouts/main-layout'));
const AuthLayout = lazy(() => import('../layouts/auth-layout'));
const Landing = lazy(() => import('../pages/Landing'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const TreinoForm = lazy(() => import('../pages/treinos/TreinoForm.jsx'));
const TreinoPublico = lazy(() => import('../pages/treinos/TreinoPublico.jsx'));

// Novas páginas adicionadas
const Semanas = lazy(() => import('../pages/semanas/Semanas'));
const SemanasRefactored = lazy(() => import('../pages/semanas/SemanasRefactored'));
const Treinos = lazy(() => import('../pages/treinos/Treinos'));
const Parametros = lazy(() => import('../pages/parametros/Parametros.js'));
const Exercicios = lazy(() => import('../pages/exercicios/ExerciciosComVideos'));
const VideoLibrary = lazy(() => import('../pages/videos/VideoLibrary'));
const Usuarios = lazy(() => import('../pages/usuarios/Usuarios'));
const Perfil = lazy(() => import('../pages/perfil/Perfil'));
const ThemePlayground = lazy(() => import('../pages/ThemePlayground'));
const ExportSettingsPage = lazy(() => import('../pages/export/ExportSettings'));

const SignIn = lazy(() => import('../pages/authentication/SignIn'));
const SignUp = lazy(() => import('../pages/authentication/SignUp'));
const Page404 = lazy(() => import('../pages/errors/Page404'));

export const routes = [
  {
    element: (
      <Suspense fallback={<Progress />}>
        <App />
      </Suspense>
    ),
    children: [
      // Rota pública: landing (portfólio) na raiz
      {
        path: rootPaths.landing,
        element: (
          <Suspense fallback={<Progress />}>
            <Landing />
          </Suspense>
        ),
      },
      // Rotas protegidas do dashboard (área autenticada)
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
          // Dashboard (index em /dashboard)
          // ==========================================
          {
            index: true,
            element: <Dashboard />,
          },

          // ==========================================
          // Treinos (paths relativos ao /dashboard)
          // ==========================================
          {
            path: 'pages/treinos',
            element: <Treinos />,
          },
          {
            path: 'pages/treinos/novo',
            element: <TreinoForm />,
          },
          {
            path: 'pages/treinos/:id/editar',
            element: <TreinoForm />,
          },

          // ==========================================
          // Exercícios
          // ==========================================
          {
            path: 'pages/exercicios',
            element: <Exercicios />,
          },

          // ==========================================
          // Biblioteca de Vídeos
          // ==========================================
          {
            path: 'pages/videos',
            element: <VideoLibrary />,
          },

          // ==========================================
          // Semanas
          // ==========================================
          {
            path: 'pages/semanas',
            element: <SemanasRefactored />,
          },

          // ==========================================
          // Exportação Avançada
          // ==========================================
          {
            path: 'pages/export-settings',
            element: <ExportSettingsPage />,
          },

          // ==========================================
          // Parâmetros da Semana
          // ==========================================
          {
            path: 'pages/parametros',
            element: <Parametros />,
          },

          // ==========================================
          // Usuários (Owner e Admin)
          // ==========================================
          {
            path: 'pages/usuarios',
            element: <Usuarios />,
          },

          // ==========================================
          // Perfil
          // ==========================================
          {
            path: 'pages/perfil',
            element: <Perfil />,
          },

          // ==========================================
          // Desenvolvimento
          // ==========================================
          {
            path: 'pages/theme-playground',
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
