import { Review } from '../entities/Review';

export interface ReviewRepository {
  create(reviewData: {
    request_id: string;
    client_id: string;
    worker_id: string;
    rating: number;
    comment?: string | null;
  }): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByRequestId(requestId: string): Promise<Review | null>;
  findByWorkerId(workerId: string): Promise<Review[]>;
  update(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Review[]>;
}

