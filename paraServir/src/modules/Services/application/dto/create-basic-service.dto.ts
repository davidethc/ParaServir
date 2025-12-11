export interface CreateBasicServiceDto {
  userId: string;
  category_id: string;
  title: string;
  description: string;
  price_type: 'hourly' | 'per_job';
  price_range?: string; // Para hourly: "1-3", "3-6", "6-9", "9+"
  years_experience: string; // "1-10", "11-50", "51-100", "101-200", "201-500", "500+"
}

export interface CreateBasicServiceResponseDto {
  serviceId: string;
  message: string;
  nextStep?: string;
}
