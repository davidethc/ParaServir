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
        email: string,
        passwordHash: string,
        role: string,
        isVerified: boolean = false
    ): Promise<User> {
        // Verificar si el usuario ya existe
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Generar ID automáticamente
        const userId = UserId.generate();
        
        const user = new User(
            userId,
            new UserEmail(email),
            new UserPasswordHash(passwordHash),
            new UserRole(role),
            isVerified ? UserVerified.createVerified() : UserVerified.createUnverified()
        );

        await this.repository.create(user);
        return user;
    }
}
