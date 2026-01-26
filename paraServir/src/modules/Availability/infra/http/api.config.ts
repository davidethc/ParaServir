/**
 * Configuración de la API del backend para Disponibilidad de Trabajadores
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    availability: {
      base: '/workers/availability',
      byWorkerId: (workerId: string) => `/workers/${workerId}/availability`,
    },
  },
};
