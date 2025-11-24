import type { WorkerId } from "./WorkerId";
import type { UserId } from "./UserId";
import type { ServiceDescription } from "./ServiceDescription";
import type { YearsExperience } from "./YearsExperience";
import type { WorkerCreatedAt } from "./WorkerCreatedAt";

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export class WorkerProfile {
    id: WorkerId;
    userId: UserId;
    serviceDescription: ServiceDescription;
    yearsExperience: YearsExperience;
    certificationUrl?: string;
    isActive: boolean;
    verificationStatus: VerificationStatus;
    createdAt: WorkerCreatedAt;
    updatedAt: Date;

    constructor(
        id: WorkerId,
        userId: UserId,
        serviceDescription: ServiceDescription,
        yearsExperience: YearsExperience,
        certificationUrl: string | undefined,
        isActive: boolean,
        verificationStatus: VerificationStatus,
        createdAt: WorkerCreatedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.serviceDescription = serviceDescription;
        this.yearsExperience = yearsExperience;
        this.certificationUrl = certificationUrl;
        this.isActive = isActive;
        this.verificationStatus = verificationStatus;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
    }
}

