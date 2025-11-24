import type { User } from "../../Domain/User";
import type { UserRepository } from "../../Domain/UserRepository";

export class InMemoryUserRepository implements UserRepository {
    constructor() {
        this.users = [];
    }

    private users: User[] = [];

    async create(user: User): Promise<void> {
        this.users.push(user);
    }
    async findById(id: string): Promise<User | null> {
        return this.users.find(user => user.id.value === id) || null;
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email.value === email) || null;
    }
    async findAll(): Promise<User[]> {
        return this.users;
    }
    async update(user: User): Promise<void> {
        const index = this.users.findIndex(u => u.id.value === user.id.value);
        if (index !== -1) {
            this.users[index] = user;
        }
    }
    async delete(id: string): Promise<void> {
        this.users = this.users.filter(user => user.id.value !== id);
    }
}