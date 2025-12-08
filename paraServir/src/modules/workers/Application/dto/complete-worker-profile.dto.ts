export interface WorkerServiceDto {
    category_id: string;
    title: string;
    description: string;
    base_price: number;
}

export interface CompleteWorkerProfileDto {
    userId: string;
    years_experience: number;
    certification_url?: string | null;
    services: WorkerServiceDto[]; // Máximo 3 servicios
}

export interface CompleteWorkerProfileResponseDto {
    workerProfileId: string;
    servicesCreated: number;
    message: string;
}

