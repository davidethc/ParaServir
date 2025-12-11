export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

