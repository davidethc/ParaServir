import type { ServiceCategoryRepository } from '../../../domain/repositories/ServiceCategoryRepository';
import type { ServiceCategory } from '../../../domain/entities/ServiceCategory';
import { apiClient } from '../ApiClient';
import { ServiceCategory as ServiceCategoryEntity } from '../../../domain/entities/ServiceCategory';
import { UUIDv4 } from '../../../domain/valueObjects/UUIDv4';

export class HttpServiceCategoryRepository implements ServiceCategoryRepository {
  async create(categoryData: {
    name: string;
    description?: string | null;
    icon?: string | null;
  }): Promise<ServiceCategory> {
    const response = await apiClient.post<{
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
    }>('/service-categories', categoryData);

    return ServiceCategoryEntity.fromPersistence({
      id: response.id,
      name: response.name,
      description: response.description,
      icon: response.icon,
    });
  }

  async findById(id: string): Promise<ServiceCategory | null> {
    try {
      const response = await apiClient.get<{
        id: string;
        name: string;
        description: string | null;
        icon: string | null;
      }>(`/service-categories/${id}`);

      return ServiceCategoryEntity.fromPersistence({
        id: response.id,
        name: response.name,
        description: response.description,
        icon: response.icon,
      });
    } catch {
      return null;
    }
  }

  async findByName(name: string): Promise<ServiceCategory | null> {
    try {
      const response = await apiClient.get<{
        id: string;
        name: string;
        description: string | null;
        icon: string | null;
      }>(`/service-categories/name/${name}`);

      return ServiceCategoryEntity.fromPersistence({
        id: response.id,
        name: response.name,
        description: response.description,
        icon: response.icon,
      });
    } catch {
      return null;
    }
  }

  async findAll(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<Array<{
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
    }>>('/service-categories');

    return response.map((category) =>
      ServiceCategoryEntity.fromPersistence({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
      })
    );
  }

  async update(category: ServiceCategory): Promise<ServiceCategory> {
    const persistence = category.toPersistence();
    const response = await apiClient.put<{
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
    }>(`/service-categories/${persistence.id}`, persistence);

    return ServiceCategoryEntity.fromPersistence({
      id: response.id,
      name: response.name,
      description: response.description,
      icon: response.icon,
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/service-categories/${id}`);
  }
}





