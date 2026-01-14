export interface ServiceCategoryDto {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    jobCount?: number;
    workers_count?: number;
    services_count?: number;
    image_url?: string;
    imageUrl?: string;
    created_at?: string;          // For "Recent" filter
    isFavorite?: boolean;         // For bookmark feature (client-side)
}

