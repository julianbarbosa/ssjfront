import { Component } from '@angular/core';
import { Button } from '../../../shared/components/button/button';
import { InputText } from '../../../shared/components/input-text/input-text';
import { Select } from '../../../shared/components/select/select';

@Component({
  selector: 'app-descargar',
  imports: [Select, InputText, Button],
  templateUrl: './descargar.html',
  styleUrl: './descargar.css',
})
export class Descargar {
  descargar(): void {
    // TODO: integrar servicio de descarga RNMC
  }
}
