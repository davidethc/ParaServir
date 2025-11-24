export class ServicePrice {
    value: number;

    constructor(value: number) {
        this.value = value;
        this.ensureIsValidPrice();
    }

    private ensureIsValidPrice() {
        if (this.value < 0) {
            throw new Error("Service price cannot be negative");
        }
        if (this.value > 999999.99) {
            throw new Error("Service price cannot exceed 999999.99");
        }
    }
}

