/**
 * Configuración de la API del backend para Workers
 * 
 * Para configurar la URL del backend, crea un archivo .env en la raíz del proyecto
 * con la siguiente variable:
 * 
 * VITE_API_URL=http://tu-backend-url.com/api
 */

export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
    
    endpoints: {
        workers: {
            base: '/workers',
            completeProfile: '/workers/profile', // Endpoint real del backend
            watch: (id: string) => `/workers/watch/${id}`,
            list: '/workers/list',
            nearby: '/workers/nearby', // Búsqueda avanzada por ubicación
            search: '/workers/search', // Búsqueda por texto de ubicación
        },
    },
};

