import type { IAuthRepository } from '../../infrastructure/http/repositories/HttpAuthRepository';

export class LogoutUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<void> {
    return await this.authRepository.logout();
  }
}

