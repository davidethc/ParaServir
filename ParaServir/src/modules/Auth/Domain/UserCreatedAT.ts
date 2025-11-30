export class UserCreatedAt {
    value : Date;

    constructor(value : Date) {
        this.value = value;
        this.ensureIsValidDate();
    }

    private ensureIsValidDate() {
        if (this.value.getTime() > new Date().getTime()) {
            throw new Error("Date must be in the future");
        }
    }
}