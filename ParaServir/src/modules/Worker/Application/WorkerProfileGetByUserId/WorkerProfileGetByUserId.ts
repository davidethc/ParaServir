import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerNotFoundError } from "../../Domain/WorkerNotFoundError";

export class WorkerProfileGetByUserId {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(userId: string) {
        const profile = await this.repository.findProfileByUserId(userId);

        if (!profile) {
            throw new WorkerNotFoundError(`Worker profile for user ${userId} not found`);
        }

        return profile;
    }
}

