export class UserEmail {
    value: string;

    constructor(value: string) {
        this.value = value.trim().toLowerCase();
        this.ensureIsValidEmail();
    }

    private ensureIsValidEmail(): void {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Email is required");
        }

        if (this.value.length > 150) {
            throw new Error("Email must be less than 150 characters");
        }

        // Validación básica de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            throw new Error("Email format is invalid");
        }
    }
}