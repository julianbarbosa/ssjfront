import { Component, Input } from '@angular/core';

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
}
