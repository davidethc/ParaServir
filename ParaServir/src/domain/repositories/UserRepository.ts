import { User } from '../entities/User';
import { Email } from '../valueObjects/Email';
import { UUIDv4 } from '../valueObjects/UUIDv4';

export interface UserRepository {
  create(userData: {
    email: string;
    password_hash: string;
    role: 'usuario' | 'trabajador' | 'admin';
  }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

