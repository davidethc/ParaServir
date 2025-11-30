export class Phone {
  private value: string;

  constructor(value: string) {
    // Phone es opcional en el esquema SQL, así que permitimos string vacío
    if (value.length > 20) {
      throw new Error("Phone cannot exceed 20 characters");
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}



