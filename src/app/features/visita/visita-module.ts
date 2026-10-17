import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { Gestion } from './gestion/gestion';
import { VisitaRoutingModule } from './visita-routing-module';

@NgModule({
  imports: [SharedModule, VisitaRoutingModule, Gestion],
})
export class VisitaModule {}
