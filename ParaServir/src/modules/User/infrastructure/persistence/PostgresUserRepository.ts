import { Pool } from "pg";
import { User } from "../../Domain/User";
import { UserCreatedAt } from "../../Domain/UserCreatedAT";
import { UserEmail } from "../../Domain/UserEmail";
import { UserId } from "../../Domain/UserId";
import { UserName } from "../../Domain/UserName";
import type { UserRepository } from "../../Domain/UserRepository";


type PostgresUser = {
  id: string;
  name: string;
  email: string;
  created_at: Date;
};

export class PostgresUserRepository implements UserRepository {
  client: Pool;

  constructor(databaseUrl: string) {
    this.client = new Pool({
      connectionString: databaseUrl,
    });
  }

  async create(user: User): Promise<void> {
    const query = {
      text: "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
      values: [user.id.value, user.name.value, user.email.value],
    };

    await this.client.query(query);
  }

  async findAll(): Promise<User[]> {
    const query = {
      text: "SELECT * FROM users",
    };

    const result = await this.client.query<PostgresUser>(query);

    return result.rows.map((row) => this.mapToDomain(row));
  }

  async findById(id: string): Promise<User | null> {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    };

    const result = await this.client.query<PostgresUser>(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return this.mapToDomain(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = {
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    };

    const result = await this.client.query<PostgresUser>(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return this.mapToDomain(row);
  }

  async update(user: User): Promise<void> {
    const query = {
      text: "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      values: [user.name.value, user.email.value, user.id.value],
    };

    await this.client.query(query);
  }

  async delete(id: string): Promise<void> {
    const query = {
      text: "DELETE FROM users WHERE id = $1",
      values: [id],
    };

    await this.client.query(query);
  }

  private mapToDomain(user: PostgresUser): User {
    return new User(
      new UserId(user.id),
      new UserName(user.name),
      new UserEmail(user.email),
      "", // password - not stored in database for security
      "user", // role - default value
      false, // isVerified - default value
      new UserCreatedAt(user.created_at)
    );
  }
}