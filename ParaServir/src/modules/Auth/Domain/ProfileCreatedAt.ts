export class ProfileCreatedAt {
  private value: Date;

  constructor(value: Date) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error("ProfileCreatedAt must be a valid Date");
    }
    this.value = value;
  }

  getValue(): Date {
    return this.value;
  }
}



