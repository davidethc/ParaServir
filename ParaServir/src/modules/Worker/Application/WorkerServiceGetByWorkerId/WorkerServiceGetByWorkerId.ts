import type { WorkerRepository } from "../../Domain/WorkerRepository";

export class WorkerServiceGetByWorkerId {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(workerId: string) {
        const services = await this.repository.findServicesByWorkerId(workerId);
        return services;
    }
}

