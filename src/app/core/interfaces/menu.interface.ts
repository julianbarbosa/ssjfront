export interface MenuChildItem {
  id: string;
  label: string;
  path: string;
  loadComponent?: string;
}

export interface MenuModuleItem {
  id: string;
  label: string;
  path: string;
  loadChildren?: string;
  children: MenuChildItem[];
}

export interface MenuConfig {
  id: string;
  label: string;
  basePath: string;
  modules: MenuModuleItem[];
}

export interface MenuData {
  menu: MenuConfig;
}
