import { UserEmail } from "../../Domain/UserEmail";
import { UserName } from "../../Domain/UserName";
import { UserNotFoundError } from "../../Domain/UserNotFoundError";
import type { UserRepository } from "../../Domain/UserRepository";

export class UserEdit {
    repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async run(id: string, name: string, email: string, password: string): Promise<void> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }
        user.name = new UserName(name);
        user.email = new UserEmail(email);
        user.password = password;
        user.updatedAt = new Date();
        await this.repository.update(user);
    }
}