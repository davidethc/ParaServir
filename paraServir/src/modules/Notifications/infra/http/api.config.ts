export const NOTIFICATION_API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
  
  endpoints: {
    notifications: {
      base: '/notifications',
      markRead: (id: string) => `/notifications/${id}/read`,
      markAllRead: '/notifications/read-all',
      byId: (id: string) => `/notifications/${id}`,
    },
  },
};
