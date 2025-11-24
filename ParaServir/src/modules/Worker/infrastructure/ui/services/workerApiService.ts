import { apiClient } from "@/shared/lib/api-client";

export interface CreateWorkerProfileRequest {
  id: string;
  user_id: string;
  service_description: string;
  years_experience: number;
  certification_url?: string;
  is_active?: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
}

export interface UpdateWorkerProfileRequest {
  service_description: string;
  years_experience: number;
  certification_url?: string;
  is_active?: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
}

export interface CreateWorkerServiceRequest {
  id: string;
  worker_id: string;
  category_id: string;
  title: string;
  description: string;
  base_price: number;
  is_available?: boolean;
}

export interface UpdateWorkerServiceRequest {
  title: string;
  description: string;
  base_price: number;
  is_available?: boolean;
}

export interface WorkerProfileResponse {
  id: string;
  user_id: string;
  service_description: string;
  years_experience: number;
  certification_url?: string;
  is_active: boolean;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerServiceResponse {
  id: string;
  worker_id: string;
  category_id: string;
  title: string;
  description: string;
  base_price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export class WorkerApiService {
  // Worker Profile methods
  async createProfile(data: CreateWorkerProfileRequest): Promise<{ message: string }> {
    return apiClient.post("/api/workers/profiles", data);
  }

  async getProfileByUserId(userId: string): Promise<WorkerProfileResponse> {
    return apiClient.get<WorkerProfileResponse>(`/api/workers/profiles/user/${userId}`);
  }

  async updateProfile(profileId: string, data: UpdateWorkerProfileRequest): Promise<{ message: string }> {
    return apiClient.put(`/api/workers/profiles/${profileId}`, data);
  }

  // Worker Service methods
  async createService(data: CreateWorkerServiceRequest): Promise<{ message: string }> {
    return apiClient.post("/api/workers/services", data);
  }

  async getServicesByWorkerId(workerId: string): Promise<WorkerServiceResponse[]> {
    return apiClient.get<WorkerServiceResponse[]>(`/api/workers/services/worker/${workerId}`);
  }

  async updateService(serviceId: string, data: UpdateWorkerServiceRequest): Promise<{ message: string }> {
    return apiClient.put(`/api/workers/services/${serviceId}`, data);
  }
}

export const workerApiService = new WorkerApiService();

