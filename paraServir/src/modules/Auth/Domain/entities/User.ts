import { UserCreatedAt } from "../value-objects/UserCreatedAt";
import { UserEmail } from "../value-objects/UserEmail";
import { UserId } from "../value-objects/UserId";
import { UserPasswordHash } from "../value-objects/UserPasswordHash";
import { UserRole } from "../value-objects/UserRole";
import { UserVerified } from "../value-objects/UserVerified";

export class User {
    id: UserId;
    email: UserEmail;
    passwordHash: UserPasswordHash;
    role: UserRole;
    isVerified: UserVerified;
    createdAt: UserCreatedAt;
    updatedAt: Date;

    constructor(
        id: UserId,
        email: UserEmail,
        passwordHash: UserPasswordHash,
        role: UserRole,
        isVerified: UserVerified,
        createdAt?: UserCreatedAt
    ) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.isVerified = isVerified;
        this.createdAt = createdAt || UserCreatedAt.now();
        this.updatedAt = new Date();
    }

    verify(): void {
        this.isVerified = UserVerified.createVerified();
        this.updatedAt = new Date();
    }

    unverify(): void {
        this.isVerified = UserVerified.createUnverified();
        this.updatedAt = new Date();
    }

    updatePassword(newPasswordHash: UserPasswordHash): void {
        this.passwordHash = newPasswordHash;
        this.updatedAt = new Date();
    }

    changeRole(newRole: UserRole): void {
        this.role = newRole;
        this.updatedAt = new Date();
    }
}