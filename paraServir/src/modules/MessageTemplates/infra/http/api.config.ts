/**
 * Configuración de la API del backend para Plantillas de Mensajes
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    messageTemplates: {
      base: '/message-templates',
      byId: (id: string) => `/message-templates/${id}`,
    },
  },
};
