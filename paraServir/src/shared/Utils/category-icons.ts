import {
    KeyRound,
    HardHat,
    Hammer,
    Wrench,
    Zap,
    Paintbrush,
    Leaf,
    Sparkles,
    BookOpen,
    Scissors,
    Car,
    Home,
    Smartphone,
    Camera,
    Shirt,
    UtensilsCrossed,
    type LucideIcon,
} from "lucide-react";

/**
 * Mapping of category names to their representative icons
 * Used for visual identification in headers and cards
 */
export const categoryIcons: Record<string, LucideIcon> = {
    // Construcción y Reparaciones
    cerrajeria: KeyRound,
    cerrajería: KeyRound,
    albanileria: HardHat,
    albañilería: HardHat,
    carpinteria: Hammer,
    carpintería: Hammer,
    plomeria: Wrench,
    plomería: Wrench,
    electricidad: Zap,
    pintura: Paintbrush,

    // Hogar y Jardín
    jardineria: Leaf,
    jardinería: Leaf,
    limpieza: Sparkles,

    // Servicios Personales
    clases: BookOpen,
    peluqueria: Scissors,
    peluquería: Scissors,

    // Automotriz
    mecanica: Car,
    mecánica: Car,

    // Otros
    reparaciones: Home,
    tecnologia: Smartphone,
    tecnología: Smartphone,
    fotografia: Camera,
    fotografía: Camera,
    costura: Shirt,
    gastronomia: UtensilsCrossed,
    gastronomía: UtensilsCrossed,
};

/**
 * Get icon component for a category name
 * Returns a default icon if category not found
 */
export function getCategoryIcon(categoryName: string): LucideIcon {
    const normalized = categoryName.toLowerCase().trim();
    return categoryIcons[normalized] || Home;
}
