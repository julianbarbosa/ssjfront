
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PersonaSaulRaw,
  VisitaCampo,
  VisitaCategoria,
  VisitaDetalle,
  VisitaEncabezado,
  VisitaFormularioCategoriaRaw,
} from '../interfaces/visita.interface';
import { serializarValorVisita } from './visita-limpia.service';

export interface VisitaGuardadoRespuesta {
  success: boolean;
  msg?: string;
  value?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.SAUL2_API_URL;

  obtenerFormulario(idVisita: number): Observable<VisitaFormularioCategoriaRaw[] | VisitaCategoria[]> {
    return this.http.get<VisitaFormularioCategoriaRaw[] | VisitaCategoria[]>(
      `${this.baseUrl}/visita/generar/${idVisita}`,
    );
  }

  /**
   * GET `/visita/{idVisita}`: detalle de la visita, la misma consulta que hace SAUL con `Visita.find`.
   * `baseUrl` no termina en "/", por eso la ruta empieza con "/visita".
   */
  findById(idVisita: string | number): Observable<VisitaDetalle> {
    return this.http.get<VisitaDetalle>(`${this.baseUrl}/visita/${idVisita}`);
  }

  urlDocumento(nombre: string): string | null {
    const archivo = nombre.trim();
    if (!archivo || archivo.includes('/') || archivo.includes('\\') || archivo.includes('..')) {
      return null;
    }
    const base = this.baseUrl.replace(/\/app_dev\.php\/?$/, '').replace(/\/app\.php\/?$/, '');
    return `${base}/upload/documentos/${encodeURIComponent(archivo)}`;
  }

  /** POST `/visita` de SAUL: un campo por petición, con su `codigo` y `tipoItem`. */
  guardarCampo(
    idVisita: number,
    campo: VisitaCampo,
    valor: string | number | boolean | null = campo.valor,
  ): Observable<VisitaGuardadoRespuesta> {
    const body = new HttpParams()
      .set('idVisita', String(idVisita))
      .set('data[0][codigo]', campo.codigo)
      .set('data[0][tipoItem]', campo.tipo)
      .set('data[0][valor]', serializarValorVisita(valor));

    return this.http.post<VisitaGuardadoRespuesta>(`${this.baseUrl}/visita`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  /**
   * Mismo POST `/visita`, en multipart. La clave del archivo es `files[codigo][file]`,
   * que es la que SAUL guarda como imagen. No se fija Content-Type: el navegador pone el boundary.
   */
  guardarImagen(idVisita: number, campo: VisitaCampo, archivo: File): Observable<VisitaGuardadoRespuesta> {
    return this.http.post<VisitaGuardadoRespuesta>(
      `${this.baseUrl}/visita`,
      cuerpoImagenVisita(idVisita, campo, archivo),
    );
  }
}

/** Pasa la entidad Visita de SAUL a los textos del encabezado. Lo que no viene queda vacío o null. */
export function aEncabezadoVisita(visita: VisitaDetalle): VisitaEncabezado {
  return {
    consecutivo: visita.idVisita,
    estado: textoOVacio(visita.estado?.nombre),
    visitador: nombrePersona(visita.visitador),
    revisor: nombrePersona(visita.supervisor),
    tipoVisita: textoOVacio(visita.tipoVisita?.descripcion),
    radicadoSolicitud: textoONull(visita.solicitud?.radicado),
    radicadoRespuesta: textoONull(visita.solicitud?.radicadohijo),
    radicadoInspeccion: textoONull(visita.radicadoInspeccion),
  };
}

function nombrePersona(persona: PersonaSaulRaw | null | undefined): string {
  return [persona?.firstName, persona?.lastName]
    .map((parte) => textoOVacio(parte))
    .filter((parte) => parte.length > 0)
    .join(' ');
}

function textoOVacio(texto: string | null | undefined): string {
  return (texto ?? '').trim();
}

function textoONull(texto: string | null | undefined): string | null {
  return textoOVacio(texto) || null;
}

/** Multipart de SAUL: el archivo viaja como `files[codigo][file]`, no como texto. */
export function cuerpoImagenVisita(idVisita: number, campo: VisitaCampo, archivo: File): FormData {
  const body = new FormData();
  body.append('idVisita', String(idVisita));
  body.append('data[0][codigo]', campo.codigo);
  body.append('data[0][tipoItem]', campo.tipo);
  body.append('data[0][valor]', serializarValorVisita(campo.valor));
  body.append(`files[${campo.codigo}][file]`, archivo, archivo.name);
  return body;
}
