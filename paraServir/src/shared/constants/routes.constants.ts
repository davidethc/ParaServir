/**
 * Constantes de rutas del proyecto
 * Centraliza todas las rutas para evitar errores de tipeo y facilitar mantenimiento
 * 
 * USO:
 * import { ROUTES } from "@/shared/constants/routes.constants";
 * navigate(ROUTES.DASHBOARD.HOME);
 */

export const ROUTES = {
  // Rutas públicas
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    REQUESTS: "/dashboard/requests",
    CREATE_REQUEST: "/dashboard/requests/create",
    VERIFY_CODE: "/verify-code",
    RESET_PASSWORD: "/reset-password",
    RESET_SUCCESS: "/reset-success",
  },

  // Rutas del Dashboard (requieren autenticación)
  DASHBOARD: {
    HOME: "/dashboard",
    CATEGORIES: "/dashboard/categories",
    CATEGORY_DETAIL: (id: string) => `/dashboard/categories/${id}`,
    // 🔽 Servicios / Solicitudes
    REQUESTS: "/dashboard/requests",
    REQUESTS_NEW: "/dashboard/requests/new",
    CHATS: "/dashboard/chats",
    SERVICES: "/dashboard/services",
    SERVICES_NEW: "/dashboard/services/new",
    SERVICE_EDIT: (id: string) => `/dashboard/services/${id}/edit`,
    HELP: "/dashboard/help",
    SETTINGS: "/dashboard/settings",
    SEARCH: (query?: string) => {
      const base = "/dashboard/search";
      return query ? `${base}?q=${encodeURIComponent(query)}` : base;
    },
  },

  // Rutas protegidas por rol (solo trabajadores)
  WORKER: {
    CREATE_SERVICE: "/create-basic-service",
    COMPLETE_PROFILE: "/complete-worker-profile",
  },

  // Rutas de navegación (links que pueden no existir aún)
  NAVIGATION: {
    JOBS: "/jobs",
    ABOUT: "/about",
    SERVICES: "/services",
    TERMS: "#",
    PRIVACY: "#",
  },
} as const;

/**
 * Helper para construir rutas dinámicas
 */
export const buildRoute = {
  categoryDetail: (categoryId: string) => ROUTES.DASHBOARD.CATEGORY_DETAIL(categoryId),
  search: (query: string) => ROUTES.DASHBOARD.SEARCH(query),
} as const;

/**
 * Verificar si una ruta requiere autenticación
 */
export const isProtectedRoute = (path: string): boolean => {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/create-basic-service") ||
    path.startsWith("/complete-worker-profile")
  );
};

/**
 * Verificar si una ruta es pública
 */
export const isPublicRoute = (path: string): boolean => {
  return (Object.values(ROUTES.PUBLIC) as string[]).includes(path);
};

/**
 * Obtener la ruta de redirección después del login según el rol
 * Usuario → categorías; Trabajador → dashboard de servicios
 */
export const getPostLoginRoute = (role: string): string => {
  if (role === "trabajador") {
    return ROUTES.DASHBOARD.SERVICES;
  }
  // Usuarios normales van directamente a ver las categorías de servicios
  return ROUTES.DASHBOARD.CATEGORIES;
};

/**
 * Obtener la ruta de redirección inmediata después de registrarse
 * Trabajador debe crear su primer servicio; usuario va a categorías
 */
export const getPostRegisterRoute = (role: string): string => {
  if (role === "trabajador") {
    return ROUTES.WORKER.CREATE_SERVICE;
  }
  return ROUTES.DASHBOARD.CATEGORIES;
};
