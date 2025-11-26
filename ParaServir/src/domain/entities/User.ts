import { UUIDv4 } from '../valueObjects/UUIDv4';
import { Email } from '../valueObjects/Email';
import { PasswordHash } from '../valueObjects/PasswordHash';

export type UserRole = 'usuario' | 'trabajador' | 'admin';

export class User {
  public readonly id: UUIDv4;
  public readonly email: Email;
  public readonly passwordHash: PasswordHash;
  public readonly role: UserRole;
  public readonly isVerified: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: UUIDv4,
    email: Email,
    passwordHash: PasswordHash,
    role: UserRole,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: UUIDv4,
    email: Email,
    passwordHash: PasswordHash,
    role: UserRole,
    isVerified: boolean = false,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): User {
    return new User(id, email, passwordHash, role, isVerified, createdAt, updatedAt);
  }

  static fromPersistence(data: {
    id: string;
    email: string;
    password_hash: string;
    role: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
  }): User {
    return new User(
      new UUIDv4(data.id),
      new Email(data.email),
      new PasswordHash(data.password_hash),
      data.role as UserRole,
      data.is_verified,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toPersistence(): {
    id: string;
    email: string;
    password_hash: string;
    role: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      password_hash: this.passwordHash.getValue(),
      role: this.role,
      is_verified: this.isVerified,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

