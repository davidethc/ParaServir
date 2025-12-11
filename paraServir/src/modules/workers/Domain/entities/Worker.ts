import { WorkerId } from "../value-objects/WorkerId";
import { WorkerUserId } from "../value-objects/WorkerUserId";
import { WorkerVerificationStatus } from "../value-objects/WorkerVerificationStatus";
import { WorkerCreatedAt } from "../value-objects/WorkerCreatedAt";

export class Worker {
    id: WorkerId;
    userId: WorkerUserId;
    yearsExperience: number;
    certificationUrl?: string;
    verificationStatus: WorkerVerificationStatus;
    isActive: boolean;
    createdAt: WorkerCreatedAt;
    updatedAt: Date;

    constructor(
        id: WorkerId,
        userId: WorkerUserId,
        yearsExperience: number = 0,
        certificationUrl?: string,
        verificationStatus?: WorkerVerificationStatus,
        isActive: boolean = true,
        createdAt?: WorkerCreatedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.yearsExperience = yearsExperience;
        this.certificationUrl = certificationUrl;
        this.verificationStatus = verificationStatus || WorkerVerificationStatus.createPending();
        this.isActive = isActive;
        this.createdAt = createdAt || WorkerCreatedAt.now();
        this.updatedAt = new Date();
    }

    verify(): void {
        this.verificationStatus = WorkerVerificationStatus.createVerified();
        this.updatedAt = new Date();
    }

    reject(): void {
        this.verificationStatus = WorkerVerificationStatus.createRejected();
        this.updatedAt = new Date();
    }

    setPending(): void {
        this.verificationStatus = WorkerVerificationStatus.createPending();
        this.updatedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    updateExperience(years: number): void {
        if (years < 0) {
            throw new Error("Years of experience cannot be negative");
        }
        this.yearsExperience = years;
        this.updatedAt = new Date();
    }

    updateCertification(url: string): void {
        this.certificationUrl = url;
        this.updatedAt = new Date();
    }
}

