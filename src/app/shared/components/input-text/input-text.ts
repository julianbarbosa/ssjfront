import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-text, app-input',
  imports: [],
  templateUrl: './input-text.html',
  styleUrl: './input-text.css',
})
export class InputText {
  @Input({ required: true }) label = '';
  @Input() id = 'input-text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() readOnly = false;
  /** Oculta la etiqueta visual. El vínculo con el control se conserva. */
  @Input() ocultarEtiqueta = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  onBlur(event: Event): void {
    if (this.readOnly) {
      return;
    }
    this.valueChange.emit((event.target as HTMLInputElement).value);
    this.blurred.emit();
  }
}
