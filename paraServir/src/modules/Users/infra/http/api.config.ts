/**
 * Configuración de la API del backend
 * 
 * Para configurar la URL del backend, crea un archivo .env en la raíz del proyecto
 * con la siguiente variable:
 * 
 * VITE_API_URL=http://tu-backend-url.com/api
 */

export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
    
    endpoints: {
        users: '/users',
        auth: {
            login: '/auth/login',
            register: '/auth/register',
        },
    },
};

