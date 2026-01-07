/**
 * DTO para representar el perfil completo de un trabajador
 */
export interface WorkerProfileDto {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  avatar_url: string | null;
  location: string | null;
  years_experience: number | null;
  certification_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
}

