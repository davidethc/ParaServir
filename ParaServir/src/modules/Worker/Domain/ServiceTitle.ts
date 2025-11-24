export class ServiceTitle {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidTitle();
    }

    private ensureIsValidTitle() {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Service title is required");
        }
        if (this.value.length < 5) {
            throw new Error("Service title must be at least 5 characters long");
        }
        if (this.value.length > 150) {
            throw new Error("Service title must be less than 150 characters long");
        }
    }
}

