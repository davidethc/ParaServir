/**
 * DTO para actualizar un usuario
 */
export interface UpdateUserDto {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  cedula?: string;
  phone?: string;
  location?: string | null;
  avatar_url?: string | null;
  role?: 'usuario' | 'trabajador' | 'admin';
}

