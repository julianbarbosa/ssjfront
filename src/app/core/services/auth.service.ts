import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, LoginResult } from '../interfaces/auth.interface';

const AUTH_STORAGE_KEY = 'ssj-auth';

export interface UsuarioAuth {
  id?: number;
  username?: string;
  nombre: string;
  correo?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated(): boolean {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  obtenerUsuario(): UsuarioAuth | null {
    const raw = sessionStorage.getItem(`${AUTH_STORAGE_KEY}-user`);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  establecerSesion(usuario: UsuarioAuth): void {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    sessionStorage.setItem(`${AUTH_STORAGE_KEY}-user`, JSON.stringify(usuario));
  }

  login(usuario: string, contrasena: string): Observable<LoginResult> {
    return this.http
      .post<LoginResponse>(`${environment.SAUL3_API_URL}/auth/login`, {
        usuario,
        contrasena,
      })
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            this.establecerSesion({
              id: response.data.id,
              username: response.data.username,
              nombre: response.data.nombre,
              correo: response.data.email,
              roles: response.data.roles,
            });
            void this.router.navigate(['/gestion-acceso-justicia/comparendo/descargar']);
            return { success: true, message: response.message };
          }

          return {
            success: false,
            message: response.message ?? 'Usuario o contraseña incorrectos.',
          };
        }),
        catchError((error) =>
          of({
            success: false,
            message:
              error?.error?.message ??
              'No fue posible iniciar sesión. Intente nuevamente.',
          }),
        ),
      );
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(`${AUTH_STORAGE_KEY}-user`);
    void this.router.navigate(['/']);
  }
}
