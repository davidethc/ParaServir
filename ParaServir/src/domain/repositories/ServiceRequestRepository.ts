import { ServiceRequest } from '../entities/ServiceRequest';

export interface ServiceRequestRepository {
  create(requestData: {
    client_id: string;
    category_id: string;
    description: string;
    worker_id?: string | null;
    service_id?: string | null;
    status?: string;
    address?: string | null;
    scheduled_date?: Date | null;
  }): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest | null>;
  findByClientId(clientId: string): Promise<ServiceRequest[]>;
  findByWorkerId(workerId: string): Promise<ServiceRequest[]>;
  update(request: ServiceRequest): Promise<ServiceRequest>;
  delete(id: string): Promise<void>;
}

