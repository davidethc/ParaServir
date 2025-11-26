import { ServiceCategory } from '../entities/ServiceCategory';
import { UUIDv4 } from '../valueObjects/UUIDv4';

export interface ServiceCategoryRepository {
  create(categoryData: {
    name: string;
    description?: string | null;
    icon?: string | null;
  }): Promise<ServiceCategory>;
  findById(id: string): Promise<ServiceCategory | null>;
  findByName(name: string): Promise<ServiceCategory | null>;
  findAll(): Promise<ServiceCategory[]>;
  update(category: ServiceCategory): Promise<ServiceCategory>;
  delete(id: string): Promise<void>;
}

