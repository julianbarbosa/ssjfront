import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VisitaCategoria, VisitaFormularioCategoriaRaw } from '../interfaces/visita.interface';

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
}
