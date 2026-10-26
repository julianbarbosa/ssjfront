import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select {
  @Input({ required: true }) label = '';
  @Input() id = 'select';
  @Input() options: string[] = [];
  @Input() value = '';
  @Input() readOnly = false;
  /** Oculta la etiqueta visual. El vínculo con el control se conserva. */
  @Input() ocultarEtiqueta = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  onChange(event: Event): void {
    if (this.readOnly) {
      return;
    }
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }

  onBlur(): void {
    if (this.readOnly) {
      return;
    }
    this.blurred.emit();
  }
}
