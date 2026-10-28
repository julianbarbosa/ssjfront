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
  /** Tipo nativo del input: fecha, hora y número usan el control del navegador, como en SAUL. */
  @Input() type: 'text' | 'date' | 'time' | 'number' = 'text';
  /** Solo para `type="number"` (SAUL usa 0.01). */
  @Input() step: string | null = null;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();
  /** Evento `change` nativo: en `type="time"` es cuando SAUL guarda (ng-change). */
  @Output() changed = new EventEmitter<string>();

  onBlur(event: Event): void {
    if (this.readOnly) {
      return;
    }
    this.valueChange.emit((event.target as HTMLInputElement).value);
    this.blurred.emit();
  }

  onChange(event: Event): void {
    if (this.readOnly) {
      return;
    }
    this.changed.emit((event.target as HTMLInputElement).value);
  }
}
