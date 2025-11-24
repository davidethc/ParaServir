import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerProfile } from "../../Domain/WorkerProfile";
import { WorkerId } from "../../Domain/WorkerId";
import { UserId } from "../../Domain/UserId";
import { ServiceDescription } from "../../Domain/ServiceDescription";
import { YearsExperience } from "../../Domain/YearsExperience";
import { WorkerCreatedAt } from "../../Domain/WorkerCreatedAt";
import { WorkerNotFoundError } from "../../Domain/WorkerNotFoundError";

export class WorkerProfileUpdate {
    constructor(private repository: WorkerRepository) {
        this.repository = repository;
    }

    async run(
        id: string,
        serviceDescription: string,
        yearsExperience: number,
        certificationUrl?: string,
        isActive?: boolean,
        verificationStatus?: 'pending' | 'approved' | 'rejected'
    ): Promise<void> {
        const existingProfile = await this.repository.findProfileById(id);

        if (!existingProfile) {
            throw new WorkerNotFoundError(id);
        }

        const updatedProfile = new WorkerProfile(
            existingProfile.id,
            existingProfile.userId,
            new ServiceDescription(serviceDescription),
            new YearsExperience(yearsExperience),
            certificationUrl,
            isActive !== undefined ? isActive : existingProfile.isActive,
            verificationStatus || existingProfile.verificationStatus,
            existingProfile.createdAt
        );

        await this.repository.updateProfile(updatedProfile);
    }
}

