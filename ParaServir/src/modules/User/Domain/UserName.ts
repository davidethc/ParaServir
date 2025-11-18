export class UserName {
    value : string;

    constructor(value : string) {
        this.value = value;
        this.ensureIsValidName();
    }

    private ensureIsValidName() {
        if (this.value.length < 3) {
            throw new Error("Name must be at least 3 characters long");
        }
        if (this.value.length > 20) {
            throw new Error("Name must be less than 20 characters long");
        }
        if (!/^[a-zA-Z]+$/.test(this.value)) {
            throw new Error("Name must contain only letters");
        }
    }
}