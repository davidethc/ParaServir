export class ProfileId {
  private value: string;

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("ProfileId cannot be empty");
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}



