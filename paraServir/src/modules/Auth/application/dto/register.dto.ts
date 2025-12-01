export interface RegisterDto {
    email: string;
    password: string;
    role?: 'usuario' | 'trabajador' | 'admin';
}

export interface RegisterResponseDto {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
}

