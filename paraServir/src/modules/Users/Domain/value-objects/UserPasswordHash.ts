export class UserPasswordHash {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidHash();
    }

    private ensureIsValidHash(): void {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Password hash is required");
        }

        // Un hash típico de bcrypt tiene al menos 60 caracteres
        if (this.value.length < 10) {
            throw new Error("Password hash appears to be invalid");
        }
    }

    static fromPlainPassword(plainPassword: string): UserPasswordHash {
        // En producción, aquí deberías hashear la contraseña con bcrypt
        // Por ahora solo validamos que tenga al menos 8 caracteres
        if (plainPassword.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        
        // Esto es un placeholder - en producción usarías bcrypt.hash()
        // return new UserPasswordHash(bcrypt.hashSync(plainPassword, 10));
        throw new Error("Use a password hashing service to create password hash");
    }
}

