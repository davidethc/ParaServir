import { UUIDv4 } from '../valueObjects/UUIDv4';

export class Profile {
  public readonly id: UUIDv4;
  public readonly userId: UUIDv4;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly cedula: string;
  public readonly phone: string | null;
  public readonly location: string | null;
  public readonly avatarUrl: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: UUIDv4,
    userId: UUIDv4,
    firstName: string,
    lastName: string,
    cedula: string,
    phone: string | null,
    location: string | null,
    avatarUrl: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cedula = cedula;
    this.phone = phone;
    this.location = location;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: UUIDv4,
    userId: UUIDv4,
    firstName: string,
    lastName: string,
    cedula: string,
    phone: string | null = null,
    location: string | null = null,
    avatarUrl: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): Profile {
    return new Profile(id, userId, firstName, lastName, cedula, phone, location, avatarUrl, createdAt, updatedAt);
  }

  static fromPersistence(data: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    cedula: string;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  }): Profile {
    return new Profile(
      new UUIDv4(data.id),
      new UUIDv4(data.user_id),
      data.first_name,
      data.last_name,
      data.cedula,
      data.phone,
      data.location,
      data.avatar_url,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toPersistence(): {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    cedula: string;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id.getValue(),
      user_id: this.userId.getValue(),
      first_name: this.firstName,
      last_name: this.lastName,
      cedula: this.cedula,
      phone: this.phone,
      location: this.location,
      avatar_url: this.avatarUrl,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

