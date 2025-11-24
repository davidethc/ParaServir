export class YearsExperience {
    value: number;

    constructor(value: number) {
        this.value = value;
        this.ensureIsValidYears();
    }

    private ensureIsValidYears() {
        if (this.value < 0) {
            throw new Error("Years of experience cannot be negative");
        }
        if (this.value > 100) {
            throw new Error("Years of experience cannot exceed 100");
        }
    }
}

