export interface LoginResponse {
  success: boolean;
  message: string;
  data: UsuarioAuthData | null;
}

export interface UsuarioAuthData {
  id: number;
  username: string;
  nombre: string;
  email: string;
  roles: string[];
}

export interface LoginResult {
  success: boolean;
  message?: string;
}
