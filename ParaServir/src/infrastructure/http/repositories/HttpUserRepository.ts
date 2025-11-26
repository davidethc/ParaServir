import type { UserRepository } from '../../../domain/repositories/UserRepository';
import type { User } from '../../../domain/entities/User';
import { apiClient } from '../ApiClient';
import { User as UserEntity } from '../../../domain/entities/User';

export class HttpUserRepository implements UserRepository {
  async create(userData: {
    email: string;
    password_hash: string;
    role: 'usuario' | 'trabajador' | 'admin';
  }): Promise<User> {
    const response = await apiClient.post<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>('/auth/register', {
      email: userData.email,
      password: userData.password_hash, // El backend espera 'password'
      role: userData.role,
    });

    return UserEntity.fromPersistence({
      id: response.id,
      email: response.email,
      password_hash: response.password_hash,
      role: response.role,
      is_verified: response.is_verified,
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
    });
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<{
        id: string;
        email: string;
        password_hash: string;
        role: string;
        is_verified: boolean;
        created_at: string;
        updated_at: string;
      }>(`/users/${id}`);

      return UserEntity.fromPersistence({
        id: response.id,
        email: response.email,
        password_hash: response.password_hash,
        role: response.role,
        is_verified: response.is_verified,
        created_at: new Date(response.created_at),
        updated_at: new Date(response.updated_at),
      });
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get<{
        id: string;
        email: string;
        password_hash: string;
        role: string;
        is_verified: boolean;
        created_at: string;
        updated_at: string;
      }>(`/users/email/${email}`);

      return UserEntity.fromPersistence({
        id: response.id,
        email: response.email,
        password_hash: response.password_hash,
        role: response.role,
        is_verified: response.is_verified,
        created_at: new Date(response.created_at),
        updated_at: new Date(response.updated_at),
      });
    } catch {
      return null;
    }
  }

  async update(user: User): Promise<User> {
    const persistence = user.toPersistence();
    const response = await apiClient.put<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>(`/users/${persistence.id}`, persistence);

    return UserEntity.fromPersistence({
      id: response.id,
      email: response.email,
      password_hash: response.password_hash,
      role: response.role,
      is_verified: response.is_verified,
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async findAll(): Promise<User[]> {
    const response = await apiClient.get<Array<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>>('/users');

    return response.map((user) =>
      UserEntity.fromPersistence({
        id: user.id,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        is_verified: user.is_verified,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      })
    );
  }
}

