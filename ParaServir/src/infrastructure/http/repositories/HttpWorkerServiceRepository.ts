import type { WorkerServiceRepository } from '../../../domain/repositories/WorkerServiceRepository';
import type { WorkerService } from '../../../domain/entities/WorkerService';
import { apiClient } from '../ApiClient';
import { WorkerService as WorkerServiceEntity } from '../../../domain/entities/WorkerService';
import { UUIDv4 } from '../../../domain/valueObjects/UUIDv4';

export class HttpWorkerServiceRepository implements WorkerServiceRepository {
  async create(serviceData: {
    worker_id: string;
    category_id: string;
    title: string;
    description: string;
    base_price?: number | null;
    is_available?: boolean;
  }): Promise<WorkerService> {
    const response = await apiClient.post<{
      id: string;
      worker_id: string;
      category_id: string;
      title: string;
      description: string;
      base_price: number | null;
      is_available: boolean;
      created_at: string;
      updated_at: string;
    }>('/worker-services', {
      workerId: serviceData.worker_id,
      categoryId: serviceData.category_id,
      title: serviceData.title,
      description: serviceData.description,
      basePrice: serviceData.base_price,
      isAvailable: serviceData.is_available,
    });

    return WorkerServiceEntity.fromPersistence({
      id: response.id,
      worker_id: response.worker_id,
      category_id: response.category_id,
      title: response.title,
      description: response.description,
      base_price: response.base_price,
      is_available: response.is_available,
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
    });
  }

  async findById(id: string): Promise<WorkerService | null> {
    try {
      const response = await apiClient.get<{
        id: string;
        worker_id: string;
        category_id: string;
        title: string;
        description: string;
        base_price: number | null;
        is_available: boolean;
        created_at: string;
        updated_at: string;
      }>(`/worker-services/${id}`);

      return WorkerServiceEntity.fromPersistence({
        id: response.id,
        worker_id: response.worker_id,
        category_id: response.category_id,
        title: response.title,
        description: response.description,
        base_price: response.base_price,
        is_available: response.is_available,
        created_at: new Date(response.created_at),
        updated_at: new Date(response.updated_at),
      });
    } catch {
      return null;
    }
  }

  async findByWorkerId(workerId: string): Promise<WorkerService[]> {
    const response = await apiClient.get<Array<{
      id: string;
      worker_id: string;
      category_id: string;
      title: string;
      description: string;
      base_price: number | null;
      is_available: boolean;
      created_at: string;
      updated_at: string;
    }>>(`/worker-services/worker/${workerId}`);

    return response.map((service) =>
      WorkerServiceEntity.fromPersistence({
        id: service.id,
        worker_id: service.worker_id,
        category_id: service.category_id,
        title: service.title,
        description: service.description,
        base_price: service.base_price,
        is_available: service.is_available,
        created_at: new Date(service.created_at),
        updated_at: new Date(service.updated_at),
      })
    );
  }

  async findByCategoryId(categoryId: string): Promise<WorkerService[]> {
    const response = await apiClient.get<Array<{
      id: string;
      worker_id: string;
      category_id: string;
      title: string;
      description: string;
      base_price: number | null;
      is_available: boolean;
      created_at: string;
      updated_at: string;
    }>>(`/worker-services/category/${categoryId}`);

    return response.map((service) =>
      WorkerServiceEntity.fromPersistence({
        id: service.id,
        worker_id: service.worker_id,
        category_id: service.category_id,
        title: service.title,
        description: service.description,
        base_price: service.base_price,
        is_available: service.is_available,
        created_at: new Date(service.created_at),
        updated_at: new Date(service.updated_at),
      })
    );
  }

  async update(service: WorkerService): Promise<WorkerService> {
    const persistence = service.toPersistence();
    const response = await apiClient.put<{
      id: string;
      worker_id: string;
      category_id: string;
      title: string;
      description: string;
      base_price: number | null;
      is_available: boolean;
      created_at: string;
      updated_at: string;
    }>(`/worker-services/${persistence.id}`, {
      title: persistence.title,
      description: persistence.description,
      basePrice: persistence.base_price,
      isAvailable: persistence.is_available,
    });

    return WorkerServiceEntity.fromPersistence({
      id: response.id,
      worker_id: response.worker_id,
      category_id: response.category_id,
      title: response.title,
      description: response.description,
      base_price: response.base_price,
      is_available: response.is_available,
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/worker-services/${id}`);
  }
}





