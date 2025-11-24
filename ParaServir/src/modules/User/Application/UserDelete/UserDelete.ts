import type { UserRepository } from "../../Domain/UserRepository";

export class UserDelete {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}