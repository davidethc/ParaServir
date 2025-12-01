import { Worker } from "../../Domain/entities/Worker";
import { WorkerNotFoundError } from "../../Domain/errors/WorkerNotFoundError";
import type { WorkerRepository } from "../../Domain/repositories/WorkerRepository";

export class WorkerGetByUserId {
    constructor(repository: WorkerRepository) {
        this.repository = repository;
    }

    private repository: WorkerRepository;

    async run(userId: string): Promise<Worker> {
        const worker = await this.repository.findByUserId(userId);
        if (!worker) {
            throw new WorkerNotFoundError("Worker not found");
        }
        return worker;
    }
}

