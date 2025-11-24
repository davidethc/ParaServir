import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerProfile } from "../../Domain/WorkerProfile";
import { WorkerId } from "../../Domain/WorkerId";
import { UserId } from "../../Domain/UserId";
import { ServiceDescription } from "../../Domain/ServiceDescription";
import { YearsExperience } from "../../Domain/YearsExperience";
import { WorkerCreatedAt } from "../../Domain/WorkerCreatedAt";

export class WorkerProfileCreate {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        userId: string,
        serviceDescription: string,
        yearsExperience: number,
        certificationUrl?: string,
        isActive: boolean = true,
        verificationStatus: 'pending' | 'approved' | 'rejected' = 'pending',
        createdAt: Date = new Date()
    ): Promise<void> {
        const profile = new WorkerProfile(
            new WorkerId(id),
            new UserId(userId),
            new ServiceDescription(serviceDescription),
            new YearsExperience(yearsExperience),
            certificationUrl,
            isActive,
            verificationStatus,
            new WorkerCreatedAt(createdAt)
        );

        await this.repository.createProfile(profile);
    }
}

