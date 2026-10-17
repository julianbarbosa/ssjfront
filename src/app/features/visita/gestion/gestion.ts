import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { VisitaCampo, VisitaCategoria } from '../../../core/interfaces/visita.interface';
import { VisitaLimpiaService } from '../../../core/services/visita-limpia.service';
import { VisitaService } from '../../../core/services/visita.service';
import { Button } from '../../../shared/components/button/button';
import { InputText } from '../../../shared/components/input-text/input-text';
import { MapComponent } from '../../../shared/components/map/map';
import { Select } from '../../../shared/components/select/select';
import { SharedModule } from '../../../shared/shared-module';

export type ModoVisualizacion = 'normal' | 'acordion' | 'horizontal';

@Component({
  selector: 'app-gestion',
  imports: [SharedModule, Button, InputText, MapComponent, Select],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class Gestion implements OnInit {
  /** Id reservado para la categoría fija «Mapa» (no viene del API). */
  readonly categoriaMapaId = 0;
  readonly categoriaMapaNombre = 'Mapa';

  readonly dataForm = signal<VisitaCategoria[]>([]);

  visualizacion: ModoVisualizacion = 'normal';
  readonly visualizaciones = ['Normal', 'Acordion', 'Horizontal'];
  categoriaHorizontalIndice = 0;
  categoriaActivaId: number | null = null;

  private readonly etiquetaPorModo: Record<ModoVisualizacion, string> = {
    normal: 'Normal',
    acordion: 'Acordion',
    horizontal: 'Horizontal',
  };

  private readonly modoPorEtiqueta: Record<string, ModoVisualizacion> = {
    Normal: 'normal',
    Acordion: 'acordion',
    Horizontal: 'horizontal',
  };

  private readonly visitaService = inject(VisitaService);
  private readonly visitaLimpiaService = inject(VisitaLimpiaService);
  private readonly route = inject(ActivatedRoute);

  idVisita: number | null = null;

  get visualizacionSeleccionada(): string {
    return this.etiquetaPorModo[this.visualizacion];
  }

  get esCategoriaMapaHorizontal(): boolean {
    return this.categoriaHorizontalIndice === 0;
  }

  get categoriaHorizontalActual(): VisitaCategoria | null {
    if (this.esCategoriaMapaHorizontal) {
      return null;
    }
    const categorias = this.dataForm();
    const indiceDatos = this.categoriaHorizontalIndice - 1;
    if (indiceDatos < 0 || indiceDatos >= categorias.length) {
      return null;
    }
    return categorias[indiceDatos];
  }

  get totalCategoriasHorizontal(): number {
    return this.dataForm().length + 1;
  }

  get indiceCategoriaHorizontalVisible(): number {
    return this.totalCategoriasHorizontal === 0 ? 0 : this.categoriaHorizontalIndice + 1;
  }

  get puedeIrCategoriaAnterior(): boolean {
    return this.categoriaHorizontalIndice > 0;
  }

  get puedeIrCategoriaSiguiente(): boolean {
    return this.categoriaHorizontalIndice < this.totalCategoriasHorizontal - 1;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('idVisita'));
      if (!Number.isFinite(id) || id <= 0) {
        this.idVisita = null;
        this.dataForm.set([]);
        return;
      }
      void this.cargarFormulario(id);
    });
  }

  private async cargarFormulario(idVisita: number): Promise<void> {
    this.idVisita = idVisita;
    const formularioRaw = await firstValueFrom(this.visitaService.obtenerFormulario(idVisita));
    const formulario = this.visitaLimpiaService.limpiar(formularioRaw);
    this.dataForm.set(formulario);
    this.categoriaHorizontalIndice = 0;
    this.categoriaActivaId = this.categoriaMapaId;
  }

  onVisualizacionChange(etiqueta: string): void {
    this.visualizacion = this.modoPorEtiqueta[etiqueta] ?? 'normal';
    if (this.visualizacion === 'horizontal') {
      this.categoriaHorizontalIndice = 0;
    }
    this.categoriaActivaId = this.categoriaMapaId;
  }

  esCategoriaMapa(id: number): boolean {
    return id === this.categoriaMapaId;
  }

  idSeccionCategoria(id: number): string {
    return `gestion-categoria-${id}`;
  }

  irACategoria(id: number): void {
    this.categoriaActivaId = id;

    if (this.visualizacion === 'horizontal') {
      if (this.esCategoriaMapa(id)) {
        this.categoriaHorizontalIndice = 0;
      } else {
        const indice = this.dataForm().findIndex((categoria) => categoria.id === id);
        if (indice >= 0) {
          this.categoriaHorizontalIndice = indice + 1;
        }
      }
      return;
    }

    const seccion = document.getElementById(this.idSeccionCategoria(id));
    if (seccion instanceof HTMLDetailsElement) {
      seccion.open = true;
    }

    seccion?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  irCategoriaAnterior(): void {
    if (this.puedeIrCategoriaAnterior) {
      this.categoriaHorizontalIndice -= 1;
      this.actualizarCategoriaActivaHorizontal();
    }
  }

  irCategoriaSiguiente(): void {
    if (this.puedeIrCategoriaSiguiente) {
      this.categoriaHorizontalIndice += 1;
      this.actualizarCategoriaActivaHorizontal();
    }
  }

  private actualizarCategoriaActivaHorizontal(): void {
    if (this.esCategoriaMapaHorizontal) {
      this.categoriaActivaId = this.categoriaMapaId;
      return;
    }
    this.categoriaActivaId = this.categoriaHorizontalActual?.id ?? null;
  }

  esSelect(campo: VisitaCampo): boolean {
    return campo.tipo === 'select-one';
  }

  esInput(campo: VisitaCampo): boolean {
    return campo.tipo !== 'select-one' && campo.tipo !== 'imagen';
  }

  labelCampo(campo: VisitaCampo): string {
    return (campo.label?.trim() || campo.nombre).trim();
  }

  valorCampo(campo: VisitaCampo): string {
    return campo.valor ?? '';
  }

  opcionesSelect(campo: VisitaCampo): string[] {
    if (campo.dominio === 'siono') {
      return ['Si', 'No'];
    }
    const valor = this.valorCampo(campo);
    return valor ? [valor] : [];
  }
}
