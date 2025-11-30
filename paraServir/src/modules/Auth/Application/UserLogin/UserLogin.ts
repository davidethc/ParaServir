import { User } from "../../Domain/entities/User";
import { UserNotFoundError } from "../../Domain/errors/UserNotFoundError";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserLogin {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(email: string, passwordHash: string): Promise<User> {
        const user = await this.repository.findByEmail(email);
        
        if (!user) {
            throw new UserNotFoundError("Invalid email or password");
        }

        // En producción, aquí compararías el hash de la contraseña usando bcrypt.compare()
        // Por ahora comparamos directamente los hashes
        if (user.passwordHash.value !== passwordHash) {
            throw new UserNotFoundError("Invalid email or password");
        }

        return user;
    }
}

