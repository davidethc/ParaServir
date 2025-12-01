export class UserCreatedAt {
    value: Date;

    constructor(value?: Date) {
        this.value = value || new Date();
        this.ensureIsValidDate();
    }

    private ensureIsValidDate(): void {
        // La fecha no puede ser en el futuro
        if (this.value.getTime() > new Date().getTime()) {
            throw new Error("Created date cannot be in the future");
        }
    }

    static now(): UserCreatedAt {
        return new UserCreatedAt(new Date());
    }
}