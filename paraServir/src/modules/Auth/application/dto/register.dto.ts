export interface RegisterDto {
    email: string;
    password: string;
    role?: 'usuario' | 'trabajador' | 'admin';
    full_name: string;
    phone: string;
    cedula?: string | null;
    location?: string | null;
    avatar_url?: string | null;
}

export interface RegisterResponseDto {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
}

