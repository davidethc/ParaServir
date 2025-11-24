import type { WorkerId } from "./WorkerId";
import type { CategoryId } from "./CategoryId";
import type { ServiceTitle } from "./ServiceTitle";
import type { ServicePrice } from "./ServicePrice";
import type { WorkerCreatedAt } from "./WorkerCreatedAt";

export class WorkerService {
    id: string;
    workerId: WorkerId;
    categoryId: CategoryId;
    title: ServiceTitle;
    description: string;
    basePrice: ServicePrice;
    isAvailable: boolean;
    createdAt: WorkerCreatedAt;
    updatedAt: Date;

    constructor(
        id: string,
        workerId: WorkerId,
        categoryId: CategoryId,
        title: ServiceTitle,
        description: string,
        basePrice: ServicePrice,
        isAvailable: boolean,
        createdAt: WorkerCreatedAt
    ) {
        this.id = id;
        this.workerId = workerId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.basePrice = basePrice;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
    }
}

