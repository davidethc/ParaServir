import { UUIDv4 } from '../valueObjects/UUIDv4';

export class Message {
  public readonly id: UUIDv4;
  public readonly requestId: UUIDv4;
  public readonly senderId: UUIDv4;
  public readonly content: string;
  public readonly createdAt: Date;

  private constructor(
    id: UUIDv4,
    requestId: UUIDv4,
    senderId: UUIDv4,
    content: string,
    createdAt: Date
  ) {
    this.id = id;
    this.requestId = requestId;
    this.senderId = senderId;
    this.content = content;
    this.createdAt = createdAt;
  }

  static create(
    id: UUIDv4,
    requestId: UUIDv4,
    senderId: UUIDv4,
    content: string,
    createdAt: Date = new Date()
  ): Message {
    return new Message(id, requestId, senderId, content, createdAt);
  }

  static fromPersistence(data: {
    id: string;
    request_id: string;
    sender_id: string;
    content: string;
    created_at: Date;
  }): Message {
    return new Message(
      new UUIDv4(data.id),
      new UUIDv4(data.request_id),
      new UUIDv4(data.sender_id),
      data.content,
      new Date(data.created_at)
    );
  }

  toPersistence(): {
    id: string;
    request_id: string;
    sender_id: string;
    content: string;
    created_at: Date;
  } {
    return {
      id: this.id.getValue(),
      request_id: this.requestId.getValue(),
      sender_id: this.senderId.getValue(),
      content: this.content,
      created_at: this.createdAt,
    };
  }
}

