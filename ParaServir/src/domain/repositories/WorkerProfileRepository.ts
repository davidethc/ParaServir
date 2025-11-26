import { WorkerProfile } from '../entities/WorkerProfile';

export interface WorkerProfileRepository {
  create(workerProfileData: {
    user_id: string;
    years_experience?: number;
    certification_url?: string | null;
    verification_status?: 'pending' | 'approved' | 'rejected';
    is_active?: boolean;
  }): Promise<WorkerProfile>;
  findById(id: string): Promise<WorkerProfile | null>;
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  update(workerProfile: WorkerProfile): Promise<WorkerProfile>;
  delete(id: string): Promise<void>;
  findAll(): Promise<WorkerProfile[]>;
}

