export class ServiceDescription {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidDescription();
    }

    private ensureIsValidDescription() {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Service description is required");
        }
        if (this.value.length < 10) {
            throw new Error("Service description must be at least 10 characters long");
        }
        if (this.value.length > 1000) {
            throw new Error("Service description must be less than 1000 characters long");
        }
    }
}

