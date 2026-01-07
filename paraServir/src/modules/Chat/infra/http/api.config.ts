/**
 * Configuración de la API del backend para Chat
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    chat: {
      base: '/chat',
      conversations: '/chat/conversations',
      messages: (requestId: string) => `/chat/${requestId}/messages`,
      start: '/chat/start',
    },
  },
};

