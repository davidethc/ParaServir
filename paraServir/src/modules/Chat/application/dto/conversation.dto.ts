/**
 * DTO para representar una conversación (solicitud de servicio con mensajes)
 */
export interface ConversationDto {
  id: string;
  request_id: string;
  status: string;
  description: string;
  other_user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string | null;
  };
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta de lista de conversaciones
 */
export interface ConversationsResponse {
  status: string;
  conversations: ConversationDto[];
}

