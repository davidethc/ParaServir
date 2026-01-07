/**
 * DTO para representar un mensaje
 */
export interface MessageDto {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string | null;
  is_own: boolean;
}

/**
 * Respuesta de mensajes de una conversación
 */
export interface MessagesResponse {
  status: string;
  messages: MessageDto[];
}

/**
 * DTO para crear un mensaje
 */
export interface CreateMessageDto {
  content: string;
}

/**
 * DTO para iniciar una conversación
 */
export interface StartConversationDto {
  request_id: string;
  content: string;
}

