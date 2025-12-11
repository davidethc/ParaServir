import type { UserRepository } from "../../../Domain/repositories/UserRepository";
import { User } from "../../../Domain/entities/User";
import { UserId } from "../../../Domain/value-objects/UserId";
import { UserEmail } from "../../../Domain/value-objects/UserEmail";
import { UserPasswordHash } from "../../../Domain/value-objects/UserPasswordHash";
import { UserRole } from "../../../Domain/value-objects/UserRole";
import { UserVerified } from "../../../Domain/value-objects/UserVerified";
import { UserCreatedAt } from "../../../Domain/value-objects/UserCreatedAt";
import { API_CONFIG } from "../api.config";

/**
 * Implementación del repositorio de usuarios que se conecta al backend remoto vía HTTP
 * Basado en el esquema SQL: users (id, email, password_hash, role, is_verified, created_at, updated_at)
 */
export class HttpUserRepository implements UserRepository {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async create(user: User): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email.value,
                    password_hash: user.passwordHash.value,
                    role: user.role.value,
                    is_verified: user.isVerified.value,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create user' }));
                throw new Error(error.message || 'Failed to create user');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create user');
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}/${id}`);
            
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to find user' }));
                throw new Error(error.message || 'Failed to find user');
            }

            const data = await response.json();
            return this.mapToUser(data);
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}?email=${encodeURIComponent(email)}`);
            
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to find user' }));
                throw new Error(error.message || 'Failed to find user');
            }

            const data = await response.json();
            // El backend puede devolver un objeto o un array
            const userData = Array.isArray(data) ? data[0] : data;
            return userData ? this.mapToUser(userData) : null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}`);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
                throw new Error(error.message || 'Failed to fetch users');
            }

            const data = await response.json();
            // El backend puede devolver un array o un objeto con data
            const users = Array.isArray(data) ? data : (data.data || []);
        return users.map((item: any) => this.mapToUser(item)); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    async update(user: User): Promise<void> {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}/${user.id.value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email.value,
                    password_hash: user.passwordHash.value,
                    role: user.role.value,
                    is_verified: user.isVerified.value,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
                throw new Error(error.message || 'Failed to update user');
            }
    }

    async delete(id: string): Promise<void> {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.users}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
                throw new Error(error.message || 'Failed to delete user');
            }
    }

    /**
     * Mapea los datos del backend (snake_case) a la entidad User del dominio
     * El backend devuelve: id, email, password_hash, role, is_verified, created_at, updated_at
     */
    private mapToUser(data: any): User { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Manejar tanto snake_case como camelCase del backend
        const id = data.id;
        const email = data.email;
        const passwordHash = data.password_hash || data.passwordHash;
        const role = data.role;
        const isVerified = data.is_verified !== undefined ? data.is_verified : data.isVerified;
        const createdAt = data.created_at ? new Date(data.created_at) : (data.createdAt ? new Date(data.createdAt) : new Date());
        const updatedAt = data.updated_at ? new Date(data.updated_at) : (data.updatedAt ? new Date(data.updatedAt) : new Date());

        const user = new User(
            new UserId(id),
            new UserEmail(email),
            new UserPasswordHash(passwordHash),
            new UserRole(role),
            isVerified ? UserVerified.createVerified() : UserVerified.createUnverified(),
            new UserCreatedAt(createdAt)
        );
        
        // Actualizar updatedAt manualmente
        user.updatedAt = updatedAt;
        
        return user;
    }
}

