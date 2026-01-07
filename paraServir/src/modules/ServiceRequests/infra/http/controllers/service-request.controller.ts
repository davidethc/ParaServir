import { CreateServiceRequestUseCase } from "@/modules/ServiceRequests/application/use-cases/create-service-request.use-case";
import { ListServiceRequestsUseCase } from "@/modules/ServiceRequests/application/use-cases/list-service-requests.use-case";
import { UpdateServiceRequestUseCase, type UpdateServiceRequestDto } from "@/modules/ServiceRequests/application/use-cases/update-service-request.use-case";
import { GetServiceRequestDetailUseCase } from "@/modules/ServiceRequests/application/use-cases/get-service-request-detail.use-case";
import { DeleteServiceRequestUseCase } from "@/modules/ServiceRequests/application/use-cases/delete-service-request.use-case";
import type { CreateServiceRequestDto } from "@/modules/ServiceRequests/application/dto/create-service-request.dto";
import type { ServiceRequestDto } from "@/modules/ServiceRequests/application/dto/service-request.dto";
import { API_CONFIG } from "../api.config";

export class ServiceRequestController {
  private createUseCase: CreateServiceRequestUseCase;
  private listUseCase: ListServiceRequestsUseCase;
  private updateUseCase: UpdateServiceRequestUseCase;
  private getDetailUseCase: GetServiceRequestDetailUseCase;
  private deleteUseCase: DeleteServiceRequestUseCase;

  constructor(apiUrl?: string) {
    const backendUrl = apiUrl || API_CONFIG.baseUrl;
    this.createUseCase = new CreateServiceRequestUseCase(backendUrl);
    this.listUseCase = new ListServiceRequestsUseCase(backendUrl);
    this.updateUseCase = new UpdateServiceRequestUseCase(backendUrl);
    this.getDetailUseCase = new GetServiceRequestDetailUseCase(backendUrl);
    this.deleteUseCase = new DeleteServiceRequestUseCase(backendUrl);
  }

  async create(dto: CreateServiceRequestDto, token: string) {
    return await this.createUseCase.execute(dto, token);
  }

  async list(params: { status?: string; as_client?: boolean; as_worker?: boolean }, token: string): Promise<ServiceRequestDto[]> {
    return await this.listUseCase.execute(token, params);
  }

  async getDetail(requestId: string, token: string): Promise<ServiceRequestDto> {
    return await this.getDetailUseCase.execute(requestId, token);
  }

  async update(id: string, dto: UpdateServiceRequestDto, token: string) {
    return await this.updateUseCase.execute(id, dto, token);
  }

  async delete(requestId: string, token: string): Promise<void> {
    return await this.deleteUseCase.execute(requestId, token);
  }
}
