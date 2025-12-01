import { Worker } from "../../Domain/entities/Worker";
import { WorkerId } from "../../Domain/value-objects/WorkerId";
import { WorkerUserId } from "../../Domain/value-objects/WorkerUserId";
import type { WorkerRepository } from "../../Domain/repositories/WorkerRepository";

export class WorkerCreate {
    constructor(repository: WorkerRepository) {
        this.repository = repository;
    }

    private repository: WorkerRepository;

    async run(
        userId: string,
        yearsExperience: number = 0,
        certificationUrl?: string
    ): Promise<Worker> {
        // Verificar si el worker ya existe para este usuario
        const existingWorker = await this.repository.findByUserId(userId);
        if (existingWorker) {
            throw new Error("Worker profile already exists for this user");
        }

        // Generar ID automáticamente
        const workerId = WorkerId.generate();
        
        const worker = new Worker(
            workerId,
            new WorkerUserId(userId),
            yearsExperience,
            certificationUrl,
            undefined, // verificationStatus - por defecto 'pending'
            true // isActive - por defecto true
        );

        await this.repository.create(worker);
        return worker;
    }
}

