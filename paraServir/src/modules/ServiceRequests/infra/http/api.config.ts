export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3900",
  endpoints: {
    requests: {
      base: "/service-requests",
    },
  },
};
