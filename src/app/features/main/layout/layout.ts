import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../../core/footer/footer';
import { Header } from '../../../core/header/header';
import { Menu } from '../../../core/menu/menu';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Menu, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
