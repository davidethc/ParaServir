import { UUIDv4 } from '../valueObjects/UUIDv4';

export type ServiceRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export class ServiceRequest {
  public readonly id: UUIDv4;
  public readonly clientId: UUIDv4;
  public readonly workerId: UUIDv4 | null;
  public readonly serviceId: UUIDv4 | null;
  public readonly categoryId: UUIDv4;
  public readonly description: string;
  public readonly status: ServiceRequestStatus;
  public readonly address: string | null;
  public readonly scheduledDate: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: UUIDv4,
    clientId: UUIDv4,
    workerId: UUIDv4 | null,
    serviceId: UUIDv4 | null,
    categoryId: UUIDv4,
    description: string,
    status: ServiceRequestStatus,
    address: string | null,
    scheduledDate: Date | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.clientId = clientId;
    this.workerId = workerId;
    this.serviceId = serviceId;
    this.categoryId = categoryId;
    this.description = description;
    this.status = status;
    this.address = address;
    this.scheduledDate = scheduledDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: UUIDv4,
    clientId: UUIDv4,
    categoryId: UUIDv4,
    description: string,
    workerId: UUIDv4 | null = null,
    serviceId: UUIDv4 | null = null,
    status: ServiceRequestStatus = 'pending',
    address: string | null = null,
    scheduledDate: Date | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): ServiceRequest {
    return new ServiceRequest(id, clientId, workerId, serviceId, categoryId, description, status, address, scheduledDate, createdAt, updatedAt);
  }

  static fromPersistence(data: {
    id: string;
    client_id: string;
    worker_id: string | null;
    service_id: string | null;
    category_id: string;
    description: string;
    status: string;
    address: string | null;
    scheduled_date: Date | null;
    created_at: Date;
    updated_at: Date;
  }): ServiceRequest {
    return new ServiceRequest(
      new UUIDv4(data.id),
      new UUIDv4(data.client_id),
      data.worker_id ? new UUIDv4(data.worker_id) : null,
      data.service_id ? new UUIDv4(data.service_id) : null,
      new UUIDv4(data.category_id),
      data.description,
      data.status as ServiceRequestStatus,
      data.address,
      data.scheduled_date ? new Date(data.scheduled_date) : null,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toPersistence(): {
    id: string;
    client_id: string;
    worker_id: string | null;
    service_id: string | null;
    category_id: string;
    description: string;
    status: string;
    address: string | null;
    scheduled_date: Date | null;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id.getValue(),
      client_id: this.clientId.getValue(),
      worker_id: this.workerId?.getValue() || null,
      service_id: this.serviceId?.getValue() || null,
      category_id: this.categoryId.getValue(),
      description: this.description,
      status: this.status,
      address: this.address,
      scheduled_date: this.scheduledDate,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

