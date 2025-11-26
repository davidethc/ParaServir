import { apiClient } from '../ApiClient';
import type { RegisterUserDTO } from '../../../application/dto/RegisterUserDTO';
import type { LoginDTO } from '../../../application/dto/LoginDTO';
import { AuthResponseDTO } from '../../../application/dto/AuthResponseDTO';

export interface IAuthRepository {
  register(dto: RegisterUserDTO): Promise<AuthResponseDTO>;
  login(dto: LoginDTO): Promise<AuthResponseDTO>;
  logout(): Promise<void>;
}

export class HttpAuthRepository implements IAuthRepository {
  async register(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    const response = await apiClient.post<{
      token: string;
      role: string;
      userId: string;
    }>('/auth/register', {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      cedula: dto.cedula,
      phone: dto.phone,
      location: dto.location,
      isWorker: dto.isWorker,
      categories: dto.categories,
    });

    // Guardar token en localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('role', response.role);
    }

    return new AuthResponseDTO({
      token: response.token,
      role: response.role,
      userId: response.userId,
    });
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const response = await apiClient.post<{
      token: string;
      role: string;
      userId: string;
    }>('/auth/login', {
      email: dto.email,
      password: dto.password,
    });

    // Guardar token en localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('role', response.role);
    }

    return new AuthResponseDTO({
      token: response.token,
      role: response.role,
      userId: response.userId,
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }
}

