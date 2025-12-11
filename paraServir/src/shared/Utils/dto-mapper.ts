/**
 * Utilidades para mapear DTOs entre frontend (camelCase) y backend (snake_case)
 */

/**
 * Convierte un objeto de camelCase a snake_case
 * Ejemplo: { firstName: "Juan" } → { first_name: "Juan" }
 */
export function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  
  return result;
}

/**
 * Convierte un objeto de snake_case a camelCase
 * Ejemplo: { first_name: "Juan" } → { firstName: "Juan" }
 */
export function toCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  
  return result;
}

/**
 * Mapea campos específicos de register DTO
 * Frontend envía: { firstName, lastName, ... }
 * Backend espera: { first_name, last_name, ... }
 */
export function mapRegisterRequest(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;
  location: string;
  avatar_url?: string | null;
  role: 'usuario' | 'trabajador' | 'admin';
}): Record<string, unknown> {
  return {
    email: dto.email,
    password: dto.password,
    first_name: dto.firstName,
    last_name: dto.lastName,
    cedula: dto.cedula,
    phone: dto.phone,
    location: dto.location,
    avatar_url: dto.avatar_url || null,
    role: dto.role,
  };
}

/**
 * Mapea la respuesta de register del backend al formato esperado por el frontend
 * Backend devuelve: { message, user: { id, email, role, is_verified }, token }
 * Frontend espera: { userId, email, role, token, nextStep? }
 */
export function mapRegisterResponse(backendResponse: {
  message?: string;
  user?: { id: string; email: string; role: string; is_verified?: boolean };
  token?: string;
}): {
  userId: string;
  email: string;
  role: string;
  token?: string;
  nextStep?: 'complete_worker_profile' | null;
} {
  // El backend puede devolver user directamente o dentro de un objeto
  const user = backendResponse.user;
  
  if (!user || !user.id) {
    throw new Error('Respuesta del backend inválida: falta información del usuario');
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    token: backendResponse.token || undefined,
    nextStep: user.role === 'trabajador' ? 'complete_worker_profile' : null,
  };
}

/**
 * Mapea la respuesta de login del backend al formato esperado por el frontend
 * Backend devuelve: { status, message, user: { id, email, role }, token }
 * Frontend espera: { token, user: { id, email, role } }
 */
export function mapLoginResponse(backendResponse: {
  status?: string;
  message?: string;
  user?: { id: string; email: string; role: string };
  token?: string;
}): {
  token: string;
  user: { id: string; email: string; role: string };
} {
  const user = backendResponse.user;
  const token = backendResponse.token;

  if (!user || !user.id || !token) {
    throw new Error('Respuesta del backend inválida: falta token o información del usuario');
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

