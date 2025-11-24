import type { User } from "../../Domain/User";
import { UserNotFoundError } from "../../Domain/UserNotFoundError";
import type { UserRepository } from "../../Domain/UserRepository";

export class UserLogin {
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  private repository: UserRepository;

  async run(email: string, password: string): Promise<User> {
    const user = await this.repository.findByEmail(email);
    
    if (!user) {
      throw new UserNotFoundError("Invalid email or password");
    }

    // En producción, aquí compararías el hash de la contraseña
    if (user.password !== password) {
      throw new UserNotFoundError("Invalid email or password");
    }

    return user;
  }
}

