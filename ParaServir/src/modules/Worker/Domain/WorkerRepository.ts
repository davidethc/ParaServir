import type { WorkerProfile } from "./WorkerProfile";
import type { WorkerService } from "./WorkerService";

export interface WorkerRepository {
    createProfile(profile: WorkerProfile): Promise<void>;
    findProfileById(id: string): Promise<WorkerProfile | null>;
    findProfileByUserId(userId: string): Promise<WorkerProfile | null>;
    updateProfile(profile: WorkerProfile): Promise<void>;
    deleteProfile(id: string): Promise<void>;
    
    createService(service: WorkerService): Promise<void>;
    findServiceById(id: string): Promise<WorkerService | null>;
    findServicesByWorkerId(workerId: string): Promise<WorkerService[]>;
    updateService(service: WorkerService): Promise<void>;
    deleteService(id: string): Promise<void>;
}

