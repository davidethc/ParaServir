import type { LoginDTO } from '../dto/LoginDTO';
import type { AuthResponseDTO } from '../dto/AuthResponseDTO';
import type { IAuthRepository } from '../../infrastructure/http/repositories/HttpAuthRepository';

export class LoginUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    return await this.authRepository.login(dto);
  }
}
