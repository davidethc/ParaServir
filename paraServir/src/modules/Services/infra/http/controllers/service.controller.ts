import { CreateBasicServiceUseCase } from "../../../application/use-cases/create-basic-service.use-case";
import { GetWorkerServicesUseCase } from "../../../application/use-cases/get-worker-services.use-case";
import { UpdateServiceUseCase } from "../../../application/use-cases/update-service.use-case";
import { DeleteServiceUseCase } from "../../../application/use-cases/delete-service.use-case";
import type { CreateBasicServiceDto, CreateBasicServiceResponseDto } from "../../../application/dto/create-basic-service.dto";
import type { WorkerServiceDto } from "../../../application/dto/worker-service.dto";
import type { UpdateServiceDto } from "../../../application/dto/update-service.dto";
import { API_CONFIG } from "../api.config";

export class ServiceController {
    private createBasicServiceUseCase: CreateBasicServiceUseCase;
    private getWorkerServicesUseCase: GetWorkerServicesUseCase;
    private updateServiceUseCase: UpdateServiceUseCase;
    private deleteServiceUseCase: DeleteServiceUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.createBasicServiceUseCase = new CreateBasicServiceUseCase(backendUrl);
        this.getWorkerServicesUseCase = new GetWorkerServicesUseCase(backendUrl);
        this.updateServiceUseCase = new UpdateServiceUseCase(backendUrl);
        this.deleteServiceUseCase = new DeleteServiceUseCase(backendUrl);
    }

    async createBasicService(dto: CreateBasicServiceDto, token: string): Promise<CreateBasicServiceResponseDto> {
        return await this.createBasicServiceUseCase.execute(dto, token);
    }

    async getWorkerServices(workerId: string, token: string): Promise<WorkerServiceDto[]> {
        return await this.getWorkerServicesUseCase.execute(workerId, token);
    }

    async updateService(serviceId: string, dto: UpdateServiceDto, token: string) {
        return await this.updateServiceUseCase.execute(serviceId, dto, token);
    }

    async deleteService(serviceId: string, token: string): Promise<void> {
        return await this.deleteServiceUseCase.execute(serviceId, token);
    }
}
