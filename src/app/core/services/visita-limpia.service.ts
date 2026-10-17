import { Injectable } from '@angular/core';
import {
  ItemVisitaCampoRaw,
  VisitaCampo,
  VisitaCategoria,
  VisitaFormularioCategoriaRaw,
} from '../interfaces/visita.interface';

type FormularioVisitaEntrada = VisitaFormularioCategoriaRaw[] | VisitaCategoria[];

@Injectable({ providedIn: 'root' })
export class VisitaLimpiaService {
  limpiar(categorias: FormularioVisitaEntrada): VisitaCategoria[] {
    if (categorias.length === 0) {
      return [];
    }

    if (this.esFormularioLimpio(categorias)) {
      return [...categorias]
        .sort((a, b) => a.posicion - b.posicion)
        .map((cat) => ({
          ...cat,
          campos: cat.campos.map((campo) => ({
            ...campo,
            clase: campo.clase ?? this.claseParaCampo(campo.tipo, campo.soloLectura),
          })),
        }));
    }

    return [...categorias]
      .sort((a, b) => a.posicion - b.posicion)
      .map((cat) => ({
        id: cat.idCategoriaItem,
        nombre: cat.nombre.trim(),
        posicion: cat.posicion,
        descripcion: cat.descripcion?.trim() || null,
        creadoEn: this.aFecha(cat.createdAt?.timestamp),
        actualizadoEn: this.aFecha(cat.updatedAt?.timestamp),
        campos: cat.arrayItems.flatMap((entry) => entry.item.items).map((it) => this.limpiarCampo(it)),
      }));
  }

  indexarPorCodigo(categorias: VisitaCategoria[]): Record<string, VisitaCampo> {
    return Object.fromEntries(categorias.flatMap((c) => c.campos).map((campo) => [campo.codigo, campo]));
  }

  private esFormularioLimpio(categorias: FormularioVisitaEntrada): categorias is VisitaCategoria[] {
    return 'campos' in categorias[0];
  }

  private limpiarCampo(it: ItemVisitaCampoRaw): VisitaCampo {
    return {
      id: it.idItemVisita,
      codigo: it.codigo,
      nombre: it.nombre.trim(),
      tipo: it.tipoItem,
      label: it.parametros?.label ?? null,
      dominio: it.parametros?.dominio ?? null,
      descripcion: it.descripcion?.trim() || null,
      soloLectura: it.soloLectura === 1,
      valor: it.valor ?? null,
      clase: this.claseParaCampo(it.tipoItem, it.soloLectura === 1),
    };
  }

  private claseParaCampo(tipo: string, soloLectura: boolean): string | null {
    const esTextoCorto = tipo === 'texto-min' || tipo === 'texto-corto';
    if (esTextoCorto && !soloLectura) {
      return 'col-md-6';
    }
    return null;
  }

  private aFecha(ts?: number): string | null {
    if (ts == null || ts <= 0) {
      return null;
    }
    return new Date(ts * 1000).toISOString();
  }
}
