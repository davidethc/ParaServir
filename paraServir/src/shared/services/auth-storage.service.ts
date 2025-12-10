/**
 * Servicio centralizado para manejo de autenticación en localStorage
 * Unifica todas las operaciones de almacenamiento de autenticación
 * 
 * BUENAS PRÁCTICAS:
 * - Un solo lugar para manejar localStorage de auth
 * - Evita duplicación de código
 * - Facilita mantenimiento y cambios futuros
 */

interface AuthData {
  token: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_ROLE: 'userRole',
} as const;

export class AuthStorageService {
  /**
   * Guarda los datos de autenticación en localStorage
   */
  static saveAuthData(data: AuthData): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId);
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.userEmail);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, data.userRole);
  }

  /**
   * Obtiene el token de autenticación
   */
  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Obtiene el ID del usuario
   */
  static getUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  }

  /**
   * Obtiene el email del usuario
   */
  static getUserEmail(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
  }

  /**
   * Obtiene el rol del usuario
   */
  static getUserRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  }

  /**
   * Obtiene todos los datos de autenticación
   */
  static getAuthData(): AuthData | null {
    const token = this.getToken();
    const userId = this.getUserId();
    const userEmail = this.getUserEmail();
    const userRole = this.getUserRole();

    if (!token || !userId || !userEmail || !userRole) {
      return null;
    }

    return {
      token,
      userId,
      userEmail,
      userRole,
    };
  }

  /**
   * Verifica si hay datos de autenticación válidos
   */
  static hasAuthData(): boolean {
    return this.getAuthData() !== null;
  }

  /**
   * Limpia todos los datos de autenticación
   */
  static clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  }

  /**
   * Actualiza solo el token (útil para refresh tokens)
   */
  static updateToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
}
