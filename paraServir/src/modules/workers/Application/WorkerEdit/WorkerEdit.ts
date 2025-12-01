import { Worker } from "../../Domain/entities/Worker";
import { WorkerNotFoundError } from "../../Domain/errors/WorkerNotFoundError";
import { WorkerVerificationStatus } from "../../Domain/value-objects/WorkerVerificationStatus";
import type { WorkerRepository } from "../../Domain/repositories/WorkerRepository";

export class WorkerEdit {
    repository: WorkerRepository;

    constructor(repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        yearsExperience?: number,
        certificationUrl?: string,
        verificationStatus?: string,
        isActive?: boolean
    ): Promise<void> {
        const worker = await this.repository.findById(id);
        if (!worker) {
            throw new WorkerNotFoundError("Worker not found");
        }

        if (yearsExperience !== undefined) {
            worker.updateExperience(yearsExperience);
        }

        if (certificationUrl !== undefined) {
            worker.updateCertification(certificationUrl);
        }

        if (verificationStatus) {
            const status = new WorkerVerificationStatus(verificationStatus);
            if (status.value === 'verified') {
                worker.verify();
            } else if (status.value === 'rejected') {
                worker.reject();
            } else {
                worker.setPending();
            }
        }

        if (isActive !== undefined) {
            if (isActive) {
                worker.activate();
            } else {
                worker.deactivate();
            }
        }

        worker.updatedAt = new Date();
        await this.repository.update(worker);
    }
}

