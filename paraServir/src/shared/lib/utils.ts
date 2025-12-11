import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función unificada para combinar clases CSS
 * Soporta strings, objetos condicionales, y arrays
 * Usa clsx para lógica condicional y twMerge para resolver conflictos de Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
