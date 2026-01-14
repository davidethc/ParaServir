import { GetConversationsUseCase } from "@/modules/Chat/application/use-cases/get-conversations.use-case";
import { GetMessagesUseCase } from "@/modules/Chat/application/use-cases/get-messages.use-case";
import { SendMessageUseCase } from "@/modules/Chat/application/use-cases/send-message.use-case";
import { StartConversationUseCase } from "@/modules/Chat/application/use-cases/start-conversation.use-case";
import type { ConversationsResponse } from "@/modules/Chat/application/dto/conversation.dto";
import type { MessagesResponse, CreateMessageDto, StartConversationDto } from "@/modules/Chat/application/dto/message.dto";
import type { MessageDto } from "@/modules/Chat/application/dto/message.dto";
import { API_CONFIG } from "../api.config";

export class ChatController {
  private getConversationsUseCase: GetConversationsUseCase;
  private getMessagesUseCase: GetMessagesUseCase;
  private sendMessageUseCase: SendMessageUseCase;
  private startConversationUseCase: StartConversationUseCase;

  constructor(apiUrl?: string) {
    const backendUrl = apiUrl || API_CONFIG.baseUrl;
    this.getConversationsUseCase = new GetConversationsUseCase(backendUrl);
    this.getMessagesUseCase = new GetMessagesUseCase(backendUrl);
    this.sendMessageUseCase = new SendMessageUseCase(backendUrl);
    this.startConversationUseCase = new StartConversationUseCase(backendUrl);
  }

  async getConversations(token: string): Promise<ConversationsResponse> {
    return await this.getConversationsUseCase.execute(token);
  }

  async getMessages(requestId: string, token: string): Promise<MessagesResponse> {
    return await this.getMessagesUseCase.execute(requestId, token);
  }

  async sendMessage(requestId: string, dto: CreateMessageDto, token: string): Promise<MessageDto> {
    return await this.sendMessageUseCase.execute(requestId, dto, token);
  }

  async startConversation(dto: StartConversationDto, token: string): Promise<MessageDto> {
    return await this.startConversationUseCase.execute(dto, token);
  }
}

