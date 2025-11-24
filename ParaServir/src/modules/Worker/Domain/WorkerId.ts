export class WorkerId {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidId();
    }

    private ensureIsValidId() {
        if (!this.value) {
            throw new Error("Worker ID is required");
        }
    }
}

