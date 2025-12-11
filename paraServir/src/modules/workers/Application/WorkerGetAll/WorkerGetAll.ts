import { Worker } from "../../Domain/entities/Worker";
import type { WorkerRepository } from "../../Domain/repositories/WorkerRepository";

export class WorkerGetAll {
    constructor(repository: WorkerRepository) {
        this.repository = repository;
    }

    private repository: WorkerRepository;

    async run(activeOnly: boolean = false): Promise<Worker[]> {
        if (activeOnly) {
            return this.repository.findActive();
        }
        return this.repository.findAll();
    }
}

