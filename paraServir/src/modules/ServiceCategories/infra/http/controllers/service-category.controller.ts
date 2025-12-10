import { GetServiceCategoriesUseCase } from "../../../application/use-cases/get-service-categories.use-case";
import { GetCategoryDetailUseCase, type CategoryDetailDto } from "../../../application/use-cases/get-category-detail.use-case";
import type { ServiceCategoryDto } from "../../../application/dto/service-category.dto";
import { API_CONFIG } from "../api.config";

export class ServiceCategoryController {
    private getServiceCategoriesUseCase: GetServiceCategoriesUseCase;
    private getCategoryDetailUseCase: GetCategoryDetailUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.getServiceCategoriesUseCase = new GetServiceCategoriesUseCase(backendUrl);
        this.getCategoryDetailUseCase = new GetCategoryDetailUseCase(backendUrl);
    }

    async getAllCategories(): Promise<ServiceCategoryDto[]> {
        return await this.getServiceCategoriesUseCase.execute();
    }

    async getCategoryDetail(categoryId: string): Promise<CategoryDetailDto> {
        return await this.getCategoryDetailUseCase.execute(categoryId);
    }
}

