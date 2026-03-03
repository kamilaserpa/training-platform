export const rootPaths = {
  /** Rota pública da landing page (portfólio) */
  landing: '/',
  /** Raiz das rotas protegidas do dashboard */
  root: '/dashboard',
  pagesRoot: 'pages',
  authRoot: 'authentication',
};

/** Prefixo base para todas as rotas internas (área autenticada) */
const dashboardBase = rootPaths.root;

/**
 * Rotas da aplicação seguindo padrão RESTful
 *
 * Estrutura:
 * - Landing: / (pública)
 * - Auth: /authentication/sign-in, sign-up
 * - Dashboard e páginas: /dashboard, /dashboard/pages/...
 */
export default {
  // ==========================================
  // Páginas públicas
  // ==========================================
  landing: rootPaths.landing,

  // ==========================================
  // Autenticação
  // ==========================================
  signin: `/${rootPaths.authRoot}/sign-in`,
  signup: `/${rootPaths.authRoot}/sign-up`,

  // ==========================================
  // Dashboard (área protegida)
  // ==========================================
  dashboard: dashboardBase,

  // ==========================================
  // Treinos (CRUD completo com rotas separadas)
  // ==========================================
  treinos: `${dashboardBase}/${rootPaths.pagesRoot}/treinos`,
  treinoNovo: `${dashboardBase}/${rootPaths.pagesRoot}/treinos/novo`,
  treinoEditar: (id: string) => `${dashboardBase}/${rootPaths.pagesRoot}/treinos/${id}/editar`,
  treinoVer: (id: string) => `${dashboardBase}/${rootPaths.pagesRoot}/treinos/${id}`,

  // ==========================================
  // Exercícios com vídeos vinculados (CRUD da relação)
  // ==========================================
  exercicios: `${dashboardBase}/${rootPaths.pagesRoot}/exercicios`,

  // ==========================================
  // Biblioteca de Vídeos
  // ==========================================
  videos: `${dashboardBase}/${rootPaths.pagesRoot}/videos`,

  // ==========================================
  // Semanas (CRUD com modal inline)
  // ==========================================
  semanas: `${dashboardBase}/${rootPaths.pagesRoot}/semanas`,
  exportSettings: `${dashboardBase}/${rootPaths.pagesRoot}/export-settings`,

  // ==========================================
  // Configurações (página única)
  // ==========================================
  parametros: `${dashboardBase}/${rootPaths.pagesRoot}/parametros`,

  // ==========================================
  // Usuários (apenas Owner e Admin)
  // ==========================================
  usuarios: `${dashboardBase}/${rootPaths.pagesRoot}/usuarios`,

  // ==========================================
  // Perfil
  // ==========================================
  perfil: `${dashboardBase}/${rootPaths.pagesRoot}/perfil`,

  // ==========================================
  // Desenvolvimento
  // ==========================================
  themePlayground: `${dashboardBase}/${rootPaths.pagesRoot}/theme-playground`,
};
