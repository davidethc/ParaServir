export type WorkerVerificationStatusType = 'pending' | 'verified' | 'rejected';

export class WorkerVerificationStatus {
    value: WorkerVerificationStatusType;

    constructor(value: string) {
        this.value = this.ensureIsValidStatus(value);
    }

    private ensureIsValidStatus(value: string): WorkerVerificationStatusType {
        const validStatuses: WorkerVerificationStatusType[] = ['pending', 'verified', 'rejected'];
        
        if (!validStatuses.includes(value as WorkerVerificationStatusType)) {
            throw new Error(`Verification status must be one of: ${validStatuses.join(', ')}`);
        }

        return value as WorkerVerificationStatusType;
    }

    static createPending(): WorkerVerificationStatus {
        return new WorkerVerificationStatus('pending');
    }

    static createVerified(): WorkerVerificationStatus {
        return new WorkerVerificationStatus('verified');
    }

    static createRejected(): WorkerVerificationStatus {
        return new WorkerVerificationStatus('rejected');
    }
}

