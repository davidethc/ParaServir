export class UserId {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidId();
    }

    private ensureIsValidId() {
        if (!this.value) {
            throw new Error("User ID is required");
        }
    }
}

