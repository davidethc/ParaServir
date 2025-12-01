import { Worker } from "../../Domain/entities/Worker";
import { WorkerNotFoundError } from "../../Domain/errors/WorkerNotFoundError";
import type { WorkerRepository } from "../../Domain/repositories/WorkerRepository";

export class WorkerGetOneById {
    constructor(repository: WorkerRepository) {
        this.repository = repository;
    }

    private repository: WorkerRepository;

    async run(id: string): Promise<Worker> {
        const worker = await this.repository.findById(id);
        if (!worker) {
            throw new WorkerNotFoundError("Worker not found");
        }
        return worker;
    }
}

