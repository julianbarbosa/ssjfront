import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Descargar } from './descargar/descargar';

const routes: Routes = [
  {
    path: 'descargar',
    component: Descargar,
  },
  {
    path: '',
    redirectTo: 'descargar',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComparendoRoutingModule {}
