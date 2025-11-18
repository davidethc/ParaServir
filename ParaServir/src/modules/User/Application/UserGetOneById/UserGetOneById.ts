import type { User } from "../../Domain/User";
import { UserNotFoundError } from "../../Domain/UserNotFoundError";
import type { UserRepository } from "../../Domain/UserRepository";

export class UserGetOneById {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(id: string) : Promise<User > {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        return user;
    }
}