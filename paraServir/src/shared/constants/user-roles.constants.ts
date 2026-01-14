/**
 * Constantes de roles de usuario
 * Centraliza las definiciones de roles para evitar errores tipográficos
 */

export const USER_ROLES = {
  USUARIO: "usuario",
  TRABAJADOR: "trabajador",
  ADMIN: "admin",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Valida si un rol es válido
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(userRole: string | undefined | null, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Verifica si un usuario es trabajador
 */
export function isWorker(userRole: string | undefined | null): boolean {
  return hasRole(userRole, USER_ROLES.TRABAJADOR);
}

/**
 * Verifica si un usuario es cliente (usuario normal)
 */
export function isClient(userRole: string | undefined | null): boolean {
  return hasRole(userRole, USER_ROLES.USUARIO);
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdmin(userRole: string | undefined | null): boolean {
  return hasRole(userRole, USER_ROLES.ADMIN);
}

