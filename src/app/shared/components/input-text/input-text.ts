import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-text',
  imports: [],
  templateUrl: './input-text.html',
  styleUrl: './input-text.css',
})
export class InputText {
  @Input({ required: true }) label = '';
  @Input() id = 'input-text';
  @Input() placeholder = '';
}
