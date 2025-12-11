/**
 * Configuración de la API del backend para Services
 */

export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
    
    endpoints: {
        services: {
            base: '/services',
            createBasic: '/workers/services',
        },
    },
};
