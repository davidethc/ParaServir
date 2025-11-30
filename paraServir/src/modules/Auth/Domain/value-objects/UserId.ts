export class UserId {
    value: string;

    constructor(value: string) {
        this.value = value;
        this.ensureIsValidId();
    }

    private ensureIsValidId(): void {
        if (!this.value || this.value.trim().length === 0) {
            throw new Error("Id is required");
        }

        // Validar formato UUID v4
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(this.value)) {
            throw new Error("Id must be a valid UUID");
        }
    }

    static generate(): UserId {
        // En producción, usarías uuid.v4() o uuid_generate_v4() de PostgreSQL
        // Por ahora retornamos un placeholder
        throw new Error("Use a UUID generator to create UserId");
    }
}