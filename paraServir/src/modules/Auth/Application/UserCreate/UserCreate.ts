import { User } from "../../Domain/entities/User";
import { UserEmail } from "../../Domain/value-objects/UserEmail";
import { UserId } from "../../Domain/value-objects/UserId";
import { UserPasswordHash } from "../../Domain/value-objects/UserPasswordHash";
import { UserRole } from "../../Domain/value-objects/UserRole";
import { UserVerified } from "../../Domain/value-objects/UserVerified";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserCreate {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(
        id: string,
        email: string,
        passwordHash: string,
        role: string,
        isVerified: boolean = false
    ): Promise<void> {
        const user = new User(
            new UserId(id),
            new UserEmail(email),
            new UserPasswordHash(passwordHash),
            new UserRole(role),
            isVerified ? UserVerified.createVerified() : UserVerified.createUnverified()
        );

        await this.repository.create(user);
    }
}
