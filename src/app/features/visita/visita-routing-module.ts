import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Gestion } from './gestion/gestion';

const routes: Routes = [
  {
    path: 'gestionar/:idVisita',
    component: Gestion,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitaRoutingModule {}
