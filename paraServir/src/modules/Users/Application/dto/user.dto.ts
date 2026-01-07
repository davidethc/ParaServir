/**
 * DTO para representar un usuario completo
 */
export interface UserDto {
  id: string;
  email: string;
  role: 'usuario' | 'trabajador' | 'admin';
  is_verified: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  location: string | null;
  avatar_url: string | null;
  worker_profile?: {
    years_experience: number | null;
    certification_url: string | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    is_active: boolean;
  };
}

