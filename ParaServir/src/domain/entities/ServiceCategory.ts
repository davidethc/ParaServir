import { UUIDv4 } from '../valueObjects/UUIDv4';

export class ServiceCategory {
  public readonly id: UUIDv4;
  public readonly name: string;
  public readonly description: string | null;
  public readonly icon: string | null;

  private constructor(
    id: UUIDv4,
    name: string,
    description: string | null,
    icon: string | null
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
  }

  static create(
    id: UUIDv4,
    name: string,
    description: string | null = null,
    icon: string | null = null
  ): ServiceCategory {
    return new ServiceCategory(id, name, description, icon);
  }

  static fromPersistence(data: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
  }): ServiceCategory {
    return new ServiceCategory(
      new UUIDv4(data.id),
      data.name,
      data.description,
      data.icon
    );
  }

  toPersistence(): {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
  } {
    return {
      id: this.id.getValue(),
      name: this.name,
      description: this.description,
      icon: this.icon,
    };
  }
}

