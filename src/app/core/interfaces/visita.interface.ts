/** Respuesta cruda del API SAUL2 (formato legacy). */
export interface ItemVisitaCampoRaw {
  idItemVisita: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  tipoItem: string;
  parametros: { dominio?: string; label?: string; opciones?: string[] } | null;
  soloLectura: number;
  valor?: string | number | boolean | null;
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

/** Formulario normalizado para la UI y el guardado. `codigo` y `valor` no se reescriben. */
export interface VisitaCampo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  label: string | null;
  dominio: string | null;
  opciones: string[] | null;
  descripcion: string | null;
  soloLectura: boolean;
  valor: string | number | boolean | null;
  /** Clases Bootstrap u otras para el contenedor del campo (ej. col-md-6). */
  clase?: string | null;
}

/** Fila visual. Las celdas apuntan a los mismos objetos de `campos`. */
export interface VisitaFilaTabla {
  titulo: string;
  celdas: (VisitaCampo | null)[];
}

/** Presentación de una categoría con varias columnas. No sustituye a `campos`. */
export interface VisitaTabla {
  encabezados: string[];
  tituloIndependiente: boolean;
  filas: VisitaFilaTabla[];
}

/** Trozo de la categoría en el orden original: una tabla o campos sueltos. */
export interface BloquePresentacion {
  tabla: VisitaTabla | null;
  campos: VisitaCampo[];
}

export interface VisitaCategoria {
  id: number;
  nombre: string;
  posicion: number;
  descripcion: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  campos: VisitaCampo[];
  tabla: VisitaTabla | null;
  /** Orden de tablas y campos sueltos. Si falta, la pantalla deriva un bloque. */
  bloques?: BloquePresentacion[];
}
