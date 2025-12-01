import { User } from "../../Domain/entities/User";
import { UserNotFoundError } from "../../Domain/errors/UserNotFoundError";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserGetByEmail {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(email: string): Promise<User> {
        const user = await this.repository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }
}

