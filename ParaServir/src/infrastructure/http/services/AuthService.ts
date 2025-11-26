import { HttpAuthRepository } from '../repositories/HttpAuthRepository';
import { RegisterUserUseCase } from '../../../application/usecases/RegisterUserUseCase';
import { LoginUseCase } from '../../../application/usecases/LoginUseCase';
import { LogoutUseCase } from '../../../application/usecases/LogoutUseCase';
import type { RegisterUserDTO } from '../../../application/dto/RegisterUserDTO';
import type { LoginDTO } from '../../../application/dto/LoginDTO';
import type { AuthResponseDTO } from '../../../application/dto/AuthResponseDTO';

class AuthService {
  private authRepository: HttpAuthRepository;
  private registerUseCase: RegisterUserUseCase;
  private loginUseCase: LoginUseCase;
  private logoutUseCase: LogoutUseCase;

  constructor() {
    this.authRepository = new HttpAuthRepository();
    this.registerUseCase = new RegisterUserUseCase(this.authRepository);
    this.loginUseCase = new LoginUseCase(this.authRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository);
  }

  async register(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    return await this.registerUseCase.execute(dto);
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    return await this.loginUseCase.execute(dto);
  }

  async logout(): Promise<void> {
    return await this.logoutUseCase.execute();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

