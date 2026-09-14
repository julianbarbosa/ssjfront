import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoGestionItem, TramiteMenuItem } from '../interfaces/tramite-menu.interface';

@Injectable({ providedIn: 'root' })
export class TramiteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.TYSA_API_URL;

  getTiposGestion(): Observable<TipoGestionItem[]> {
    return this.http.get<TipoGestionItem[]>(`${this.baseUrl}/v1/tramite/tiposdegestion`);
  }

  getTiposPublico(): Observable<TramiteMenuItem[]> {
    return this.http.get<TramiteMenuItem[]>(`${this.baseUrl}/v1/tramite/tiposdepublico`);
  }

  getDependencias(): Observable<TramiteMenuItem[]> {
    return this.http.get<TramiteMenuItem[]>(`${this.baseUrl}/v1/tramite/dependencias`);
  }

  getEstadosAutomatizacion(): Observable<TramiteMenuItem[]> {
    return this.http.get<TramiteMenuItem[]>(`${this.baseUrl}/v1/tramite/estadosautomatizacion`);
  }
}
