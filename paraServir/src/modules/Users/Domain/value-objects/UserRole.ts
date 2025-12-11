export type UserRoleType = 'usuario' | 'trabajador' | 'admin';

export class UserRole {
    value: UserRoleType;

    constructor(value: string) {
        this.value = this.ensureIsValidRole(value);
    }

    private ensureIsValidRole(value: string): UserRoleType {
        const validRoles: UserRoleType[] = ['usuario', 'trabajador', 'admin'];
        
        if (!validRoles.includes(value as UserRoleType)) {
            throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
        }

        return value as UserRoleType;
    }

    static createUsuario(): UserRole {
        return new UserRole('usuario');
    }

    static createTrabajador(): UserRole {
        return new UserRole('trabajador');
    }

    static createAdmin(): UserRole {
        return new UserRole('admin');
    }
}

