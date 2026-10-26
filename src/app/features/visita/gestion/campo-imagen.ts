import { Component, EventEmitter, Input, Output } from '@angular/core';

import { VisitaCampo } from '../../../core/interfaces/visita.interface';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-campo-imagen',
  imports: [Button],
  templateUrl: './campo-imagen.html',
  styleUrl: './campo-imagen.css',
})
export class CampoImagen {
  @Input({ required: true }) campo!: VisitaCampo;
  @Input({ required: true }) etiqueta = '';
  @Input() ocultarEtiqueta = false;
  @Input() nombre = '';
  @Input() vistaPrevia: string | null = null;
  @Input() urlGuardada: string | null = null;
  @Input() noDisponible = false;

  @Output() archivoChange = new EventEmitter<Event>();
  @Output() quitar = new EventEmitter<void>();
  @Output() noDisponibleChange = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();
}
