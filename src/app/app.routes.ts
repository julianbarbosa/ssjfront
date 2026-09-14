import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/login/login';
import { Layout } from './features/main/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Iniciar sesión - Gestión Acceso Justicia',
  },
  {
    path: 'gestion-acceso-justicia',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'comparendo',
        loadChildren: () =>
          import('./features/comparendo/comparendo-module').then((m) => m.ComparendoModule),
      },
      {
        path: '',
        redirectTo: 'comparendo/descargar',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
