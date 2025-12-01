import { Worker } from "../entities/Worker";

export interface WorkerRepository {
    create(worker: Worker): Promise<void>;
    findById(id: string): Promise<Worker | null>;
    findByUserId(userId: string): Promise<Worker | null>;
    findAll(): Promise<Worker[]>;
    findActive(): Promise<Worker[]>;
    update(worker: Worker): Promise<void>;
    delete(id: string): Promise<void>;
}

