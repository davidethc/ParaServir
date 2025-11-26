import { AdminAction } from '../entities/AdminAction';

export interface AdminActionRepository {
  create(adminActionData: {
    admin_id: string;
    action: string;
    details?: string | null;
  }): Promise<AdminAction>;
  findById(id: string): Promise<AdminAction | null>;
  findByAdminId(adminId: string): Promise<AdminAction[]>;
  findAll(): Promise<AdminAction[]>;
  delete(id: string): Promise<void>;
}

