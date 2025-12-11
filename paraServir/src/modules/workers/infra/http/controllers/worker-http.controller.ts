import { CompleteWorkerProfileUseCase } from "../../../Application/use-cases/complete-worker-profile.use-case";
import type { CompleteWorkerProfileDto, CompleteWorkerProfileResponseDto } from "../../../Application/dto/complete-worker-profile.dto";
import { API_CONFIG } from "../api.config";

export class WorkerHttpController {
    private completeWorkerProfileUseCase: CompleteWorkerProfileUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.completeWorkerProfileUseCase = new CompleteWorkerProfileUseCase(backendUrl);
    }

    async completeProfile(dto: CompleteWorkerProfileDto, token: string): Promise<CompleteWorkerProfileResponseDto> {
        return await this.completeWorkerProfileUseCase.execute(dto, token);
    }
}

