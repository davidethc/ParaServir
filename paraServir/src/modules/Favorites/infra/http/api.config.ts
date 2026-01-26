/**
 * Configuración de la API del backend para Favoritos
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    favorites: {
      base: '/favorites',
      byWorkerId: (workerId: string) => `/favorites/${workerId}`,
    },
  },
};
