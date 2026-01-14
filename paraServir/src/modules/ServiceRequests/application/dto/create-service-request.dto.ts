export interface CreateServiceRequestDto {
  category_id: string;
  description: string;
  address: string;
  scheduled_date: string; // ISO string
  worker_id?: string;
  service_id?: string;
}

export interface CreateServiceRequestDTO {
  worker_id?: string;
  service_id?: string;
  category_id: string;
  description: string;
  address?: string;
  scheduled_date?: string;
}
