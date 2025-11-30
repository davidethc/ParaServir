export class AvatarUrl {
  private value: string | null;

  constructor(value: string | null) {
    // AvatarUrl es opcional (puede ser null)
    this.value = value;
  }

  getValue(): string | null {
    return this.value;
  }
}



