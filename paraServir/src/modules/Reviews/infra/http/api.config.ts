/**
 * Configuración de la API del backend para Reviews
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    reviews: {
      base: '/reviews',
      worker: (workerId: string) => `/reviews/worker/${workerId}`,
      client: '/reviews/client',
      request: (requestId: string) => `/reviews/request/${requestId}`,
      byId: (id: string) => `/reviews/${id}`,
    },
  },
};

