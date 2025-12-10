import { CreateBasicServiceUseCase } from "../../../application/use-cases/create-basic-service.use-case";
import type { CreateBasicServiceDto, CreateBasicServiceResponseDto } from "../../../application/dto/create-basic-service.dto";
import { API_CONFIG } from "../api.config";

export class ServiceController {
    private createBasicServiceUseCase: CreateBasicServiceUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.createBasicServiceUseCase = new CreateBasicServiceUseCase(backendUrl);
    }

    async createBasicService(dto: CreateBasicServiceDto, token: string): Promise<CreateBasicServiceResponseDto> {
        return await this.createBasicServiceUseCase.execute(dto, token);
    }
}
