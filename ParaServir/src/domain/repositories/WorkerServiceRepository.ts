import { WorkerService } from '../entities/WorkerService';

export interface WorkerServiceRepository {
  create(serviceData: {
    worker_id: string;
    category_id: string;
    title: string;
    description: string;
    base_price?: number | null;
    is_available?: boolean;
  }): Promise<WorkerService>;
  findById(id: string): Promise<WorkerService | null>;
  findByWorkerId(workerId: string): Promise<WorkerService[]>;
  findByCategoryId(categoryId: string): Promise<WorkerService[]>;
  update(service: WorkerService): Promise<WorkerService>;
  delete(id: string): Promise<void>;
}

