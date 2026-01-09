import paths, { rootPaths } from './paths';

export interface SubMenuItem {
  subheader: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: number | string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  items?: SubMenuItem[];
  requireAuth?: boolean; // Nova propriedade para controlar visibilidade
  isLogout?: boolean; // Nova propriedade para identificar o botão de logout
}

const sitemap: MenuItem[] = [
  {
    id: 1,
    subheader: 'Dashboard',
    path: rootPaths.root,
    icon: 'ic:round-home',
    requireAuth: true,
  },
  {
    id: 2,
    subheader: 'Semanas',
    path: paths.semanas,
    icon: 'ic:round-calendar-today',
    requireAuth: true,
  },
  {
    id: 3,
    subheader: 'Treinos',
    path: paths.treinos,
    icon: 'ic:round-fitness-center',
    requireAuth: true,
  },
  {
    id: 4,
    subheader: 'Exercícios',
    path: paths.exercicios,
    icon: 'ic:round-directions-run',
    requireAuth: true,
  },
  {
    id: 5,
    subheader: 'Configurações',
    path: paths.configuracoes,
    icon: 'ic:round-settings',
    requireAuth: true,
  },
  {
    id: 6,
    subheader: 'Logout',
    icon: 'ic:round-logout',
    requireAuth: true,
    isLogout: true,
  },
];

export default sitemap;
