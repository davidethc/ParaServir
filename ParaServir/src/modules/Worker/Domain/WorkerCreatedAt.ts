export class WorkerCreatedAt {
    value: Date;

    constructor(value: Date) {
        this.value = value;
        this.ensureIsValidDate();
    }

    private ensureIsValidDate() {
        if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
            throw new Error("Created date must be a valid date");
        }
    }
}

