import type { User } from "../../Domain/User";
import type { UserRepository } from "../../Domain/UserRepository";

export class UserGetAll {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run() : Promise<User[]> {
        return this.repository.findAll();
    }
}