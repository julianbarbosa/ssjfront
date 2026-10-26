import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BloquePresentacion, VisitaCampo, VisitaCategoria, VisitaTabla } from '../../../core/interfaces/visita.interface';
import { VisitaLimpiaService } from '../../../core/services/visita-limpia.service';
import { VisitaService } from '../../../core/services/visita.service';
import { Button } from '../../../shared/components/button/button';
import { InputText } from '../../../shared/components/input-text/input-text';
import { MapComponent } from '../../../shared/components/map/map';
import { Select } from '../../../shared/components/select/select';
import { SharedModule } from '../../../shared/shared-module';
import { CampoImagen } from './campo-imagen';
import { configuracionVisita } from './configuracion-visita';

export type ModoVisualizacion = 'normal' | 'acordion' | 'horizontal';

interface ParRegistro {
  imagen: VisitaCampo;
  descripcion: VisitaCampo;
}

interface CeldaRegistro {
  campo: VisitaCampo;
  clase: string;
  salto: boolean;
}

interface BloqueCampos {
  id: number;
  filas: CeldaRegistro[][];
  campos: VisitaCampo[];
}

@Component({
  selector: 'app-gestion',
  imports: [SharedModule, Button, CampoImagen, InputText, MapComponent, Select],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class Gestion implements OnInit, OnDestroy {
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
  mensajeError = '';

  private readonly versionCampo = new Map<string, number>();
  private readonly archivosPendientes = new Map<string, { file: File; vistaPrevia: string }>();
  private readonly archivoEnviado = new Map<string, File>();
  private readonly bloquesPorCampos = new WeakMap<VisitaCampo[], BloqueCampos[]>();
  private readonly sueltosPorCategoria = new WeakMap<VisitaCategoria, VisitaCampo[]>();
  private readonly bloquesPorCategoria = new WeakMap<VisitaCategoria, BloquePresentacion[]>();
  private readonly contextoPorCampo = new WeakMap<
    VisitaCampo,
    { campo: VisitaCampo; etiqueta: string; ocultarEtiqueta: boolean }
  >();
  private readonly imagenesNoDisponibles = new Set<string>();
  private readonly extensionesImagen = ['png', 'jpeg', 'jpg'];

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

  ngOnDestroy(): void {
    this.liberarSelecciones();
  }

  private async cargarFormulario(idVisita: number): Promise<void> {
    this.liberarSelecciones();
    this.imagenesNoDisponibles.clear();
    this.idVisita = idVisita;
    const formularioRaw = await firstValueFrom(this.visitaService.obtenerFormulario(idVisita));
    const formulario = this.visitaLimpiaService.limpiar(formularioRaw, configuracionVisita);
    console.log(formulario);
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

  esImagen(campo: VisitaCampo): boolean {
    return campo.tipo === 'imagen';
  }

  /** Orden de tablas y campos. Si la categoría no trae bloques, se arma uno estable. */
  bloquesCategoria(categoria: VisitaCategoria): BloquePresentacion[] {
    if (categoria.bloques?.length) {
      return categoria.bloques;
    }
    const guardados = this.bloquesPorCategoria.get(categoria);
    if (guardados) {
      return guardados;
    }
    const bloques: BloquePresentacion[] = categoria.tabla
      ? [
          { tabla: categoria.tabla, campos: [] },
          { tabla: null, campos: this.camposFueraDeTabla(categoria) },
        ]
      : [{ tabla: null, campos: categoria.campos }];
    this.bloquesPorCategoria.set(categoria, bloques);
    return bloques;
  }

  /** Campos que no están en la tabla. La celda de la tabla es el mismo objeto, así que no se pinta dos veces. */
  camposFueraDeTabla(categoria: VisitaCategoria): VisitaCampo[] {
    const guardados = this.sueltosPorCategoria.get(categoria);
    if (guardados) {
      return guardados;
    }
    const enTabla = new Set<VisitaCampo>();
    for (const fila of categoria.tabla?.filas ?? []) {
      for (const celda of fila.celdas) {
        if (celda) {
          enTabla.add(celda);
        }
      }
    }
    const sueltos = categoria.campos.filter((campo) => !enTabla.has(campo));
    this.sueltosPorCategoria.set(categoria, sueltos);
    return sueltos;
  }

  bloquesCampos(campos: VisitaCampo[]): BloqueCampos[] {
    const guardados = this.bloquesPorCampos.get(campos);
    if (guardados) {
      return guardados;
    }
    const bloques: BloqueCampos[] = [];
    let pares: ParRegistro[] = [];
    const cerrarPares = (): void => {
      if (pares.length === 0) {
        return;
      }
      const filas: CeldaRegistro[][] = [];
      for (let indice = 0; indice < pares.length; indice += 2) {
        filas.push(this.celdasRegistro(pares[indice], pares[indice + 1]));
      }
      bloques.push({ id: filas[0][0].campo.id, filas, campos: [] });
      pares = [];
    };

    for (let indice = 0; indice < campos.length; indice += 1) {
      const imagen = campos[indice];
      const descripcion = campos[indice + 1];
      const numero = this.numeroRegistro(imagen.codigo, 'imagen_registro');
      if (
        imagen.tipo === 'imagen' &&
        numero &&
        descripcion &&
        this.numeroRegistro(descripcion.codigo, 'descripcion_registro') === numero
      ) {
        pares.push({ imagen, descripcion });
        indice += 1;
        continue;
      }
      cerrarPares();
      bloques.push({ id: imagen.id, filas: [], campos: [imagen] });
    }
    cerrarPares();
    this.bloquesPorCampos.set(campos, bloques);
    return bloques;
  }

  contextoCampo(campo: VisitaCampo, etiqueta: string, ocultarEtiqueta = false) {
    const existente = this.contextoPorCampo.get(campo);
    if (existente) {
      existente.etiqueta = etiqueta;
      existente.ocultarEtiqueta = ocultarEtiqueta;
      return existente;
    }
    const contexto = { campo, etiqueta, ocultarEtiqueta };
    this.contextoPorCampo.set(campo, contexto);
    return contexto;
  }

  private celdasRegistro(izquierda: ParRegistro, derecha?: ParRegistro): CeldaRegistro[] {
    const claseIzquierda = izquierda.descripcion.clase || 'col-md-6';
    if (!derecha) {
      return [
        { campo: izquierda.imagen, clase: claseIzquierda, salto: false },
        { campo: izquierda.descripcion, clase: claseIzquierda, salto: true },
      ];
    }
    const claseDerecha = derecha.descripcion.clase || 'col-md-6';
    return [
      { campo: izquierda.imagen, clase: `${claseIzquierda} order-md-1`, salto: false },
      { campo: izquierda.descripcion, clase: `${claseIzquierda} order-md-3`, salto: false },
      { campo: derecha.imagen, clase: `${claseDerecha} order-md-2`, salto: false },
      { campo: derecha.descripcion, clase: `${claseDerecha} order-md-4`, salto: false },
    ];
  }

  nombreArchivo(campo: VisitaCampo): string {
    return this.archivoPendiente(campo.codigo)?.name || this.referenciaGuardada(campo) || 'Ningún archivo seleccionado';
  }

  private numeroRegistro(codigo: string, prefijo: 'imagen_registro' | 'descripcion_registro'): string | null {
    const coincidencia = codigo.match(new RegExp(`${prefijo}(\\d+)$`));
    return coincidencia?.[1] ?? null;
  }

  archivoPendiente(codigo: string): File | null {
    return this.archivosPendientes.get(codigo)?.file ?? null;
  }

  vistaPrevia(codigo: string): string | null {
    return this.archivosPendientes.get(codigo)?.vistaPrevia ?? null;
  }

  referenciaGuardada(campo: VisitaCampo): string | null {
    if (typeof campo.valor !== 'string') {
      return null;
    }
    const nombre = campo.valor.trim();
    return nombre && nombre !== 'null' ? nombre : null;
  }

  urlImagenGuardada(campo: VisitaCampo): string | null {
    const nombre = this.referenciaGuardada(campo);
    return nombre ? this.visitaService.urlDocumento(nombre) : null;
  }

  imagenNoDisponible(codigo: string): boolean {
    return this.imagenesNoDisponibles.has(codigo);
  }

  marcarImagenNoDisponible(codigo: string): void {
    this.imagenesNoDisponibles.add(codigo);
  }

  onArchivoSeleccionado(campo: VisitaCampo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo || campo.soloLectura || this.idVisita === null) {
      return;
    }

    const partes = archivo.name.split('.');
    const extension = partes.length > 1 ? (partes.pop()?.toLowerCase() ?? '') : '';
    if (this.extensionesImagen.indexOf(extension) === -1) {
      this.mensajeError = 'Solo se permiten archivos con extensión PNG, JPEG o JPG.';
      return;
    }

    this.liberarSeleccion(campo.codigo);
    const vistaPrevia = URL.createObjectURL(archivo);
    this.archivosPendientes.set(campo.codigo, { file: archivo, vistaPrevia });
    this.mensajeError = '';
    this.saveItem(campo);
  }

  limpiarSeleccion(campo: VisitaCampo): void {
    this.liberarSeleccion(campo.codigo);
  }

  private liberarSeleccion(codigo: string): void {
    const pendiente = this.archivosPendientes.get(codigo);
    if (pendiente) {
      URL.revokeObjectURL(pendiente.vistaPrevia);
      this.archivosPendientes.delete(codigo);
    }
    this.archivoEnviado.delete(codigo);
  }

  private liberarSelecciones(): void {
    for (const codigo of this.archivosPendientes.keys()) {
      this.liberarSeleccion(codigo);
    }
  }

  labelCampo(campo: VisitaCampo): string {
    return (campo.label?.trim() || campo.nombre).trim();
  }

  valorCampo(campo: VisitaCampo): string {
    if (campo.valor === null || campo.valor === undefined) {
      return '';
    }
    return String(campo.valor);
  }

  opcionesSelect(campo: VisitaCampo): string[] {
    if (campo.opciones && campo.opciones.length > 0) {
      return campo.opciones;
    }
    if (campo.dominio === 'siono') {
      return ['Si', 'No'];
    }
    const valor = this.valorCampo(campo);
    return valor ? [valor] : [];
  }

  etiquetaColumna(tabla: VisitaTabla, indiceCelda: number): string {
    const desplazamiento = tabla.tituloIndependiente ? 1 : 0;
    return tabla.encabezados[indiceCelda + desplazamiento] ?? '';
  }

  /** Texto del campo que no está ya en el encabezado ni en el título de la fila. */
  etiquetaAdicional(campo: VisitaCampo, encabezado: string, tituloFila: string): string {
    const propia = this.labelCampo(campo);
    if (this.mismoTexto(propia, encabezado) || this.mismoTexto(propia, tituloFila)) {
      return '';
    }
    return propia;
  }

  etiquetaAccesible(tituloFila: string, encabezado: string, adicional: string): string {
    const partes = [tituloFila, encabezado, adicional];
    const unicas: string[] = [];
    for (const parte of partes) {
      const texto = parte.trim();
      if (texto && !unicas.some((existente) => this.mismoTexto(existente, texto))) {
        unicas.push(texto);
      }
    }
    return unicas.join(', ');
  }

  private mismoTexto(a: string, b: string): boolean {
    return this.normalizarTexto(a) === this.normalizarTexto(b);
  }

  private normalizarTexto(texto: string): string {
    return texto.trim().toLocaleLowerCase('es').replace(/\s+/g, ' ');
  }

  actualizarValor(campo: VisitaCampo, texto: string): void {
    if (campo.soloLectura) {
      return;
    }
    campo.valor = this.valorDesdeTexto(campo.valor, texto);
  }

  saveItem(campo: VisitaCampo | undefined): void {
    if (campo === undefined || campo.soloLectura || this.idVisita === null) {
      return;
    }

    const idVisita = this.idVisita;
    let valorEnviado = campo.valor;
    let archivo: File | null = null;

    if (campo.tipo === 'hora') {
      valorEnviado = this.formatearInstante(campo.valor, { timeZone: 'America/Bogota' });
    } else if (campo.tipo === 'fecha') {
      valorEnviado = this.formatearInstante(campo.valor, {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    } else if (campo.tipo === 'imagen') {
      archivo = this.archivoPendiente(campo.codigo);
      if (!archivo) {
        return;
      }
      const partes = archivo.name.split('.');
      const extension = partes.length > 1 ? (partes.pop()?.toLowerCase() ?? '') : '';
      if (this.extensionesImagen.indexOf(extension) === -1) {
        this.mensajeError = 'Solo se permiten archivos con extensión PNG, JPEG o JPG.';
        return;
      }
      if (this.archivoEnviado.get(campo.codigo) === archivo) {
        return;
      }
      this.archivoEnviado.set(campo.codigo, archivo);
    }

    const version = (this.versionCampo.get(campo.codigo) ?? 0) + 1;
    this.versionCampo.set(campo.codigo, version);
    this.mensajeError = '';

    const peticion = archivo
      ? this.visitaService.guardarImagen(idVisita, campo, archivo)
      : this.visitaService.guardarCampo(idVisita, campo, valorEnviado);

    peticion.subscribe({
      next: (respuesta) => {
        if (this.versionCampo.get(campo.codigo) !== version) {
          return;
        }
        if (!respuesta?.success || respuesta.success !== true) {
          this.archivoEnviado.delete(campo.codigo);
          this.mensajeError =
            'Ha ocurrido un error en response informe al desarrollador. Gracias. ' + (respuesta?.msg ?? '');
          return;
        }
        if (respuesta.value && respuesta.value !== '') {
          this.actualizarPorAtributo(campo.codigo, respuesta.value);
          if (archivo) {
            this.imagenesNoDisponibles.delete(campo.codigo);
            this.liberarSeleccion(campo.codigo);
          }
        }
      },
      error: () => {
        if (this.versionCampo.get(campo.codigo) !== version) {
          return;
        }
        this.archivoEnviado.delete(campo.codigo);
        this.mensajeError = '2Ha ocurrido un error informe al desarrollador. Gracias.';
      },
    });
  }

  private formatearInstante(
    valor: string | number | boolean | null,
    options: Intl.DateTimeFormatOptions,
  ): string | number | boolean | null {
    if (valor === null || valor === '' || typeof valor === 'boolean') {
      return valor;
    }
    const dateObject = new Date(valor);
    if (Number.isNaN(dateObject.getTime())) {
      return valor;
    }
    return dateObject.toLocaleString('en-US', options);
  }

  private actualizarPorAtributo(codigo: string, nuevoValor: string): void {
    const campo = this.visitaLimpiaService.indexarPorCodigo(this.dataForm())[codigo];
    if (campo) {
      campo.valor = nuevoValor;
    }
  }

  private valorDesdeTexto(
    anterior: string | number | boolean | null,
    texto: string,
  ): string | number | boolean | null {
    if (texto === '' && (anterior === null || anterior === undefined)) {
      return null;
    }
    if (typeof anterior === 'number' && String(anterior) === texto) {
      return anterior;
    }
    return texto;
  }

}
