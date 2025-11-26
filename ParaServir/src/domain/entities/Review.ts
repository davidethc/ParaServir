import { UUIDv4 } from '../valueObjects/UUIDv4';

export class Review {
  public readonly id: UUIDv4;
  public readonly requestId: UUIDv4;
  public readonly clientId: UUIDv4;
  public readonly workerId: UUIDv4;
  public readonly rating: number;
  public readonly comment: string | null;
  public readonly createdAt: Date;

  private constructor(
    id: UUIDv4,
    requestId: UUIDv4,
    clientId: UUIDv4,
    workerId: UUIDv4,
    rating: number,
    comment: string | null,
    createdAt: Date
  ) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    this.id = id;
    this.requestId = requestId;
    this.clientId = clientId;
    this.workerId = workerId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
  }

  static create(
    id: UUIDv4,
    requestId: UUIDv4,
    clientId: UUIDv4,
    workerId: UUIDv4,
    rating: number,
    comment: string | null = null,
    createdAt: Date = new Date()
  ): Review {
    return new Review(id, requestId, clientId, workerId, rating, comment, createdAt);
  }

  static fromPersistence(data: {
    id: string;
    request_id: string;
    client_id: string;
    worker_id: string;
    rating: number;
    comment: string | null;
    created_at: Date;
  }): Review {
    return new Review(
      new UUIDv4(data.id),
      new UUIDv4(data.request_id),
      new UUIDv4(data.client_id),
      new UUIDv4(data.worker_id),
      data.rating,
      data.comment,
      new Date(data.created_at)
    );
  }

  toPersistence(): {
    id: string;
    request_id: string;
    client_id: string;
    worker_id: string;
    rating: number;
    comment: string | null;
    created_at: Date;
  } {
    return {
      id: this.id.getValue(),
      request_id: this.requestId.getValue(),
      client_id: this.clientId.getValue(),
      worker_id: this.workerId.getValue(),
      rating: this.rating,
      comment: this.comment,
      created_at: this.createdAt,
    };
  }
}

