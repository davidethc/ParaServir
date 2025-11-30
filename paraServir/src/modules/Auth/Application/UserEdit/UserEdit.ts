import { User } from "../../Domain/entities/User";
import { UserEmail } from "../../Domain/value-objects/UserEmail";
import { UserNotFoundError } from "../../Domain/errors/UserNotFoundError";
import { UserPasswordHash } from "../../Domain/value-objects/UserPasswordHash";
import { UserRole } from "../../Domain/value-objects/UserRole";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserEdit {
    repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        email?: string,
        passwordHash?: string,
        role?: string
    ): Promise<void> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        if (email) {
            user.email = new UserEmail(email);
        }

        if (passwordHash) {
            user.updatePassword(new UserPasswordHash(passwordHash));
        }

        if (role) {
            user.changeRole(new UserRole(role));
        }

        user.updatedAt = new Date();
        await this.repository.update(user);
    }
}