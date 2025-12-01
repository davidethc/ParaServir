import { User } from "../../Domain/entities/User";
import { UserNotFoundError } from "../../Domain/errors/UserNotFoundError";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserGetOneById {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(id: string): Promise<User> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }
}