export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3900',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
    },
    USERS: {
      BASE: '/users',
      BY_ID: (id: string) => `/users/${id}`,
      BY_EMAIL: (email: string) => `/users/email/${email}`,
    },
  },
} as const;

