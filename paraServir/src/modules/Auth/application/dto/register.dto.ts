export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    cedula: string;
    phone: string;
    location: string;
    avatar_url?: string | null;
    role: 'usuario' | 'trabajador' | 'admin';
}

export interface RegisterResponseDto {
    userId: string;
    email: string;
    role: string;
    token?: string;
    nextStep?: 'complete_worker_profile' | null;
}

