import { Message } from '../entities/Message';

export interface MessageRepository {
  create(messageData: {
    request_id: string;
    sender_id: string;
    content: string;
  }): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByRequestId(requestId: string): Promise<Message[]>;
  update(message: Message): Promise<Message>;
  delete(id: string): Promise<void>;
}

