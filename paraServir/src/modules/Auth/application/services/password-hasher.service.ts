export interface PasswordHasherService {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasherService implements PasswordHasherService {
    async hash(password: string): Promise<string> {
        // En producción, usarías bcrypt.hash()
        // const salt = await bcrypt.genSalt(10);
        // return await bcrypt.hash(password, salt);
        
        // Placeholder para desarrollo
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        
        // En producción, esto debería ser un hash real
        return `hashed_${password}`;
    }

    async compare(password: string, hash: string): Promise<boolean> {
        // En producción, usarías bcrypt.compare()
        // return await bcrypt.compare(password, hash);
        
        // Placeholder para desarrollo
        return hash === `hashed_${password}`;
    }
}

