export class Cedula {
  private value: string;

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("Cedula cannot be empty");
    }
    if (value.length > 20) {
      throw new Error("Cedula cannot exceed 20 characters");
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}



