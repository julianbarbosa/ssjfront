import { Component } from '@angular/core';
import { BarraGovCo } from './barra-gov-co/barra-gov-co';
import { BloqueLogo } from './bloque-logo/bloque-logo';

@Component({
  selector: 'app-header',
  imports: [BarraGovCo, BloqueLogo],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
