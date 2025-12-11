// User se usa implícitamente a través de user.verify()
import { UserNotFoundError } from "../../Domain/errors/UserNotFoundError";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserVerify {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(id: string): Promise<void> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        user.verify();
        await this.repository.update(user);
    }
}

