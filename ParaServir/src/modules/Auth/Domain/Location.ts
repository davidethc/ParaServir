export class Location {
  private value: string;

  constructor(value: string) {
    // Location es TEXT en SQL, así que no hay límite de caracteres
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}



