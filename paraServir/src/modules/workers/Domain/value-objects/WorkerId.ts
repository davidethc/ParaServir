export class WorkerId {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidId();
    }

    private ensureIsValidId(): void {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Worker ID is required");
        }

        // Validar formato UUID v4
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(this.value)) {
            throw new Error("Worker ID must be a valid UUID");
        }
    }

    static generate(): WorkerId {
        // Generar UUID v4 usando crypto.randomUUID() (disponible en navegadores modernos)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return new WorkerId(crypto.randomUUID());
        }
        throw new Error("UUID generation not available. Use crypto.randomUUID() or install uuid package");
    }
}

