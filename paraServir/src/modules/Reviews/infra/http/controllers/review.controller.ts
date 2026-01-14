import { CreateReviewUseCase } from "@/modules/Reviews/application/use-cases/create-review.use-case";
import { GetWorkerReviewsUseCase } from "@/modules/Reviews/application/use-cases/get-worker-reviews.use-case";
import { GetClientReviewsUseCase } from "@/modules/Reviews/application/use-cases/get-client-reviews.use-case";
import { GetRequestReviewUseCase } from "@/modules/Reviews/application/use-cases/get-request-review.use-case";
import { UpdateReviewUseCase } from "@/modules/Reviews/application/use-cases/update-review.use-case";
import { DeleteReviewUseCase } from "@/modules/Reviews/application/use-cases/delete-review.use-case";
import type { CreateReviewDto } from "@/modules/Reviews/application/dto/create-review.dto";
import type { UpdateReviewDto } from "@/modules/Reviews/application/dto/update-review.dto";
import type { ReviewDto, WorkerReviewsResponse, ClientReviewsResponse } from "@/modules/Reviews/application/dto/review.dto";
import { API_CONFIG } from "../api.config";

export class ReviewController {
  private createUseCase: CreateReviewUseCase;
  private getWorkerReviewsUseCase: GetWorkerReviewsUseCase;
  private getClientReviewsUseCase: GetClientReviewsUseCase;
  private getRequestReviewUseCase: GetRequestReviewUseCase;
  private updateUseCase: UpdateReviewUseCase;
  private deleteUseCase: DeleteReviewUseCase;

  constructor(apiUrl?: string) {
    const backendUrl = apiUrl || API_CONFIG.baseUrl;
    this.createUseCase = new CreateReviewUseCase(backendUrl);
    this.getWorkerReviewsUseCase = new GetWorkerReviewsUseCase(backendUrl);
    this.getClientReviewsUseCase = new GetClientReviewsUseCase(backendUrl);
    this.getRequestReviewUseCase = new GetRequestReviewUseCase(backendUrl);
    this.updateUseCase = new UpdateReviewUseCase(backendUrl);
    this.deleteUseCase = new DeleteReviewUseCase(backendUrl);
  }

  async create(dto: CreateReviewDto, token: string): Promise<ReviewDto> {
    return await this.createUseCase.execute(dto, token);
  }

  async getWorkerReviews(workerId: string): Promise<WorkerReviewsResponse> {
    return await this.getWorkerReviewsUseCase.execute(workerId);
  }

  async getClientReviews(token: string): Promise<ClientReviewsResponse> {
    return await this.getClientReviewsUseCase.execute(token);
  }

  async getRequestReview(requestId: string): Promise<ReviewDto | null> {
    return await this.getRequestReviewUseCase.execute(requestId);
  }

  async update(reviewId: string, dto: UpdateReviewDto, token: string): Promise<ReviewDto> {
    return await this.updateUseCase.execute(reviewId, dto, token);
  }

  async delete(reviewId: string, token: string): Promise<void> {
    return await this.deleteUseCase.execute(reviewId, token);
  }
}

