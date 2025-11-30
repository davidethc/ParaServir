export class LastName {
  private value: string;

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("LastName cannot be empty");
    }
    if (value.length > 80) {
      throw new Error("LastName cannot exceed 80 characters");
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}



