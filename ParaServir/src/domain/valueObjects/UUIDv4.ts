export class UUIDv4 {
  private readonly value: string;

  constructor(uuid: string) {
    if (!this.isValid(uuid)) {
      throw new Error('Invalid UUID v4 format');
    }
    this.value = uuid;
  }

  private isValid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UUIDv4): boolean {
    return this.value === other.value;
  }

  static generate(): UUIDv4 {
    // This is a placeholder - in production, use uuid library
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    return new UUIDv4(generateUUID());
  }
}

