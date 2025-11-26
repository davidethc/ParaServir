import type { RegisterUserDTO } from '../dto/RegisterUserDTO';
import type { AuthResponseDTO } from '../dto/AuthResponseDTO';
import type { IAuthRepository } from '../../infrastructure/http/repositories/HttpAuthRepository';

export class RegisterUserUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    return await this.authRepository.register(dto);
  }
}
