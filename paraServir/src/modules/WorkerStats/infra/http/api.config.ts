/**
 * Configuración de la API del backend para Estadísticas de Trabajadores
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    workerStats: {
      base: '/workers/stats',
    },
  },
};
