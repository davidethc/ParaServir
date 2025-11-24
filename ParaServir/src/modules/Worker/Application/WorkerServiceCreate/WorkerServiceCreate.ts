import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerService } from "../../Domain/WorkerService";
import { WorkerId } from "../../Domain/WorkerId";
import { CategoryId } from "../../Domain/CategoryId";
import { ServiceTitle } from "../../Domain/ServiceTitle";
import { ServicePrice } from "../../Domain/ServicePrice";
import { WorkerCreatedAt } from "../../Domain/WorkerCreatedAt";

export class WorkerServiceCreate {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        workerId: string,
        categoryId: string,
        title: string,
        description: string,
        basePrice: number,
        isAvailable: boolean = true,
        createdAt: Date = new Date()
    ): Promise<void> {
        const service = new WorkerService(
            id,
            new WorkerId(workerId),
            new CategoryId(categoryId),
            new ServiceTitle(title),
            description,
            new ServicePrice(basePrice),
            isAvailable,
            new WorkerCreatedAt(createdAt)
        );

        await this.repository.createService(service);
    }
}

