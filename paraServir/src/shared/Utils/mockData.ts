// Datos mock para desarrollo cuando el backend no está disponible

export const MOCK_SERVICE_CATEGORIES = [
  {
    id: "cat-1",
    name: "Desarrollo IT",
    description: "Desarrollo de software y aplicaciones",
    icon: "dev",
    jobCount: 3450,
  },
  {
    id: "cat-2",
    name: "Finanzas",
    description: "Servicios contables y financieros",
    icon: "finance",
    jobCount: 1965,
  },
  {
    id: "cat-3",
    name: "Salud",
    description: "Servicios de salud y bienestar",
    icon: "health",
    jobCount: 2812,
  },
  {
    id: "cat-4",
    name: "Ventas y Marketing",
    description: "Estrategias de marketing y ventas",
    icon: "marketing",
    jobCount: 2198,
  },
  {
    id: "cat-5",
    name: "Educación",
    description: "Servicios educativos y tutorías",
    icon: "education",
    jobCount: 1511,
  },
  {
    id: "cat-6",
    name: "Diseño",
    description: "Diseño gráfico y UX/UI",
    icon: "design",
    jobCount: 2988,
  },
  {
    id: "cat-7",
    name: "Investigación",
    description: "Servicios de investigación y análisis",
    icon: "research",
    jobCount: 1233,
  },
  {
    id: "cat-8",
    name: "Recursos Humanos",
    description: "Servicios de RRHH y reclutamiento",
    icon: "hr",
    jobCount: 1836,
  },
  {
    id: "cat-9",
    name: "Carpintería",
    description: "Trabajo en madera y muebles",
    icon: "carp",
    jobCount: 892,
  },
  {
    id: "cat-10",
    name: "Plomería",
    description: "Reparación de tuberías y sistemas de agua",
    icon: "plom",
    jobCount: 1245,
  },
  {
    id: "cat-11",
    name: "Electricidad",
    description: "Instalaciones eléctricas y reparaciones",
    icon: "elec",
    jobCount: 1567,
  },
  {
    id: "cat-12",
    name: "Pintura",
    description: "Pintura de interiores y exteriores",
    icon: "paint",
    jobCount: 1034,
  },
];

export const MOCK_USER_ID = "mock-user-" + Date.now();
export const MOCK_TOKEN = "mock-token-" + Date.now();

// Simular delay de red
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

