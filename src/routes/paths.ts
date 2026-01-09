export const rootPaths = {
  root: '/',
  pagesRoot: 'pages',
  authRoot: 'authentication',
};

/**
 * Rotas da aplicação seguindo padrão RESTful
 * 
 * Estrutura:
 * - Listagem: /pages/recurso
 * - Criar: /pages/recurso/novo
 * - Editar: /pages/recurso/:id/editar
 * - Ver: /pages/recurso/:id (quando aplicável)
 */
export default {
  // ==========================================
  // Autenticação
  // ==========================================
  signin: `/${rootPaths.authRoot}/sign-in`,
  signup: `/${rootPaths.authRoot}/sign-up`,

  // ==========================================
  // Dashboard
  // ==========================================
  dashboard: `/${rootPaths.pagesRoot}`,

  // ==========================================
  // Treinos (CRUD completo com rotas separadas)
  // ==========================================
  treinos: `/${rootPaths.pagesRoot}/treinos`,
  treinoNovo: `/${rootPaths.pagesRoot}/treinos/novo`,
  treinoEditar: (id: string) => `/${rootPaths.pagesRoot}/treinos/${id}/editar`,
  treinoVer: (id: string) => `/${rootPaths.pagesRoot}/treinos/${id}`,
  
  // ==========================================
  // Exercícios (CRUD com modal inline)
  // ==========================================
  exercicios: `/${rootPaths.pagesRoot}/exercicios`,
  
  // ==========================================
  // Semanas (CRUD com modal inline)
  // ==========================================
  semanas: `/${rootPaths.pagesRoot}/semanas`,
  
  // ==========================================
  // Configurações (página única)
  // ==========================================
  configuracoes: `/${rootPaths.pagesRoot}/configuracoes`,
  
  // ==========================================
  // Desenvolvimento
  // ==========================================
  themePlayground: `/${rootPaths.pagesRoot}/theme-playground`,
};
