export class CategoryId {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidId();
    }

    private ensureIsValidId() {
        if (!this.value) {
            throw new Error("Category ID is required");
        }
    }
}

