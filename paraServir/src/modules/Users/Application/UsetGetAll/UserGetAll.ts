import { User } from "../../Domain/entities/User";
import type { UserRepository } from "../../Domain/repositories/UserRepository";

export class UserGetAll {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(): Promise<User[]> {
        return this.repository.findAll();
    }
}