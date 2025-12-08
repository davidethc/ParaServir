import { GetServiceCategoriesUseCase } from "../../../application/use-cases/get-service-categories.use-case";
import type { ServiceCategoryDto } from "../../../application/dto/service-category.dto";
import { API_CONFIG } from "../api.config";

export class ServiceCategoryController {
    private getServiceCategoriesUseCase: GetServiceCategoriesUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.getServiceCategoriesUseCase = new GetServiceCategoriesUseCase(backendUrl);
    }

    async getAllCategories(): Promise<ServiceCategoryDto[]> {
        return await this.getServiceCategoriesUseCase.execute();
    }
}

