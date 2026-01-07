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
}

const sitemap: MenuItem[] = [
  {
    id: 1,
    subheader: 'Dashboard',
    path: rootPaths.root,
    icon: 'ic:round-home',
    active: true,
  },
  {
    id: 2,
    subheader: 'Semanas',
    path: paths.semanas,
    icon: 'ic:round-calendar-today',
  },
  {
    id: 3,
    subheader: 'Treinos',
    path: paths.treinos,
    icon: 'ic:round-fitness-center',
  },
  {
    id: 4,
    subheader: 'Exercícios',
    path: paths.exercicios,
    icon: 'ic:round-directions-run',
  },
  {
    id: 5,
    subheader: 'Configurações',
    path: paths.configuracoes,
    icon: 'ic:round-settings',
  },
  {
    id: 6,
    subheader: 'Theme Playground',
    path: paths.themePlayground,
    icon: 'ic:round-palette',
  },
  {
    id: 7,
    subheader: 'Sign In',
    path: paths.signin,
    icon: 'ic:round-lock',
  },
  {
    id: 8,
    subheader: 'Sign Up',
    path: paths.signup,
    icon: 'ic:baseline-person-add-alt-1',
  },
];

export default sitemap;
