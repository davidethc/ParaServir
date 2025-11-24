import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerService } from "../../Domain/WorkerService";
import { WorkerId } from "../../Domain/WorkerId";
import { CategoryId } from "../../Domain/CategoryId";
import { ServiceTitle } from "../../Domain/ServiceTitle";
import { ServicePrice } from "../../Domain/ServicePrice";
import { WorkerCreatedAt } from "../../Domain/WorkerCreatedAt";
import { WorkerNotFoundError } from "../../Domain/WorkerNotFoundError";

export class WorkerServiceUpdate {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        title: string,
        description: string,
        basePrice: number,
        isAvailable?: boolean
    ): Promise<void> {
        const existingService = await this.repository.findServiceById(id);

        if (!existingService) {
            throw new WorkerNotFoundError(id);
        }

        const updatedService = new WorkerService(
            existingService.id,
            existingService.workerId,
            existingService.categoryId,
            new ServiceTitle(title),
            description,
            new ServicePrice(basePrice),
            isAvailable !== undefined ? isAvailable : existingService.isAvailable,
            existingService.createdAt
        );

        await this.repository.updateService(updatedService);
    }
}

