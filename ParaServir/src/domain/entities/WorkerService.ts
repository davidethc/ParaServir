import { UUIDv4 } from '../valueObjects/UUIDv4';

export class WorkerService {
  public readonly id: UUIDv4;
  public readonly workerId: UUIDv4;
  public readonly categoryId: UUIDv4;
  public readonly title: string;
  public readonly description: string;
  public readonly basePrice: number | null;
  public readonly isAvailable: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: UUIDv4,
    workerId: UUIDv4,
    categoryId: UUIDv4,
    title: string,
    description: string,
    basePrice: number | null,
    isAvailable: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.workerId = workerId;
    this.categoryId = categoryId;
    this.title = title;
    this.description = description;
    this.basePrice = basePrice;
    this.isAvailable = isAvailable;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: UUIDv4,
    workerId: UUIDv4,
    categoryId: UUIDv4,
    title: string,
    description: string,
    basePrice: number | null = null,
    isAvailable: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): WorkerService {
    return new WorkerService(id, workerId, categoryId, title, description, basePrice, isAvailable, createdAt, updatedAt);
  }

  static fromPersistence(data: {
    id: string;
    worker_id: string;
    category_id: string;
    title: string;
    description: string;
    base_price: number | null;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
  }): WorkerService {
    return new WorkerService(
      new UUIDv4(data.id),
      new UUIDv4(data.worker_id),
      new UUIDv4(data.category_id),
      data.title,
      data.description,
      data.base_price ? Number(data.base_price) : null,
      data.is_available,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toPersistence(): {
    id: string;
    worker_id: string;
    category_id: string;
    title: string;
    description: string;
    base_price: number | null;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id.getValue(),
      worker_id: this.workerId.getValue(),
      category_id: this.categoryId.getValue(),
      title: this.title,
      description: this.description,
      base_price: this.basePrice,
      is_available: this.isAvailable,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

