import { UUIDv4 } from '../valueObjects/UUIDv4';

export class AdminAction {
  public readonly id: UUIDv4;
  public readonly adminId: UUIDv4;
  public readonly action: string;
  public readonly details: string | null;
  public readonly createdAt: Date;

  private constructor(
    id: UUIDv4,
    adminId: UUIDv4,
    action: string,
    details: string | null,
    createdAt: Date
  ) {
    this.id = id;
    this.adminId = adminId;
    this.action = action;
    this.details = details;
    this.createdAt = createdAt;
  }

  static create(
    id: UUIDv4,
    adminId: UUIDv4,
    action: string,
    details: string | null = null,
    createdAt: Date = new Date()
  ): AdminAction {
    return new AdminAction(id, adminId, action, details, createdAt);
  }

  static fromPersistence(data: {
    id: string;
    admin_id: string;
    action: string;
    details: string | null;
    created_at: Date;
  }): AdminAction {
    return new AdminAction(
      new UUIDv4(data.id),
      new UUIDv4(data.admin_id),
      data.action,
      data.details,
      new Date(data.created_at)
    );
  }

  toPersistence(): {
    id: string;
    admin_id: string;
    action: string;
    details: string | null;
    created_at: Date;
  } {
    return {
      id: this.id.getValue(),
      admin_id: this.adminId.getValue(),
      action: this.action,
      details: this.details,
      created_at: this.createdAt,
    };
  }
}

