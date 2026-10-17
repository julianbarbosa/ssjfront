/** Respuesta cruda del API SAUL2 (formato legacy). */
export interface ItemVisitaCampoRaw {
  idItemVisita: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  tipoItem: string;
  parametros: { dominio?: string; label?: string } | null;
  soloLectura: number;
  valor?: string | null;
}

export interface VisitaFormularioCategoriaRaw {
  idCategoriaItem: number;
  nombre: string;
  descripcion: string | null;
  posicion: number;
  createdAt?: { timestamp: number };
  updatedAt?: { timestamp: number };
  arrayDescripcion?: string[];
  arrayItems: {
    item: {
      nombre: string;
      items: ItemVisitaCampoRaw[];
    };
  }[];
}

/** Formulario normalizado para la UI. */
export interface VisitaCampo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  label: string | null;
  dominio: string | null;
  descripcion: string | null;
  soloLectura: boolean;
  valor?: string | null;
  /** Clases Bootstrap u otras para el contenedor del campo (ej. col-md-6). */
  clase?: string | null;
}

export interface VisitaCategoria {
  id: number;
  nombre: string;
  posicion: number;
  descripcion: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  campos: VisitaCampo[];
}
