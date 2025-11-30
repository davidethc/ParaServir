export class UserEmail {
    value : string;

    constructor(value : string) {
        this.value = value;
        this.ensureIsValidEmail();
    }

    private ensureIsValidEmail() {
        if (!this.value.includes("@")) {
            throw new Error("Email is required");
        }
    }
}