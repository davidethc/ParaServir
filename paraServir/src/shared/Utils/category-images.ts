/**
 * Mapeo de nombres de categorías a imágenes locales
 * Las imágenes están en src/shared/Assets/
 * 
 * En Vite, las imágenes importadas se optimizan automáticamente durante el build
 */

// Importar todas las imágenes
import AlbanilImg from "@/shared/Assets/Albanil.png";
import AsesoriaImg from "@/shared/Assets/Asesoria.png";
import CarpinteroImg from "@/shared/Assets/Carpintero.png";
import CerrajeroImg from "@/shared/Assets/Cerrajero.png";
import ClasesImg from "@/shared/Assets/Clases.png";
import CocinaImg from "@/shared/Assets/Cocina.png";
import ConduccionImg from "@/shared/Assets/Conduccion.png";
import CuidadoAdultosImg from "@/shared/Assets/CuidadoAdultos.png";
import CuidadoNiñosImg from "@/shared/Assets/CuidadoNiños.png";
import ElectricistaImg from "@/shared/Assets/Electricista.png";
import ElectronicaImg from "@/shared/Assets/Electronica.png";
import EntrenadorPersonalImg from "@/shared/Assets/EntrenadorPersonal.png";
import EsteticaImg from "@/shared/Assets/Estetica.png";
import FontaneriaImg from "@/shared/Assets/Fontaneria.png";
import FotografoImg from "@/shared/Assets/Fotografo.png";
import JardineroImg from "@/shared/Assets/Jardinero.png";
import LimpiezaImg from "@/shared/Assets/Limpieza.png";
import LimpiezaProfundaImg from "@/shared/Assets/LimpiezaProfunda.png";
import MudanzaImg from "@/shared/Assets/Mudanza.png";
import PintorImg from "@/shared/Assets/Pintor.png";
import PlomeroImg from "@/shared/Assets/Plomero.png";
import RefrigeracionImg from "@/shared/Assets/Refrigeracion.png";

/**
 * Mapeo de nombres de categorías (normalizados) a imágenes
 * Los nombres se normalizan a minúsculas y sin acentos para facilitar el matching
 */
const categoryImageMap: Record<string, string> = {
  // Albañilería
  "albañilería": AlbanilImg,
  "albanileria": AlbanilImg,
  "albañil": AlbanilImg,
  "albanil": AlbanilImg,
  "construcción": AlbanilImg,
  "construccion": AlbanilImg,
  
  // Asesoría Legal
  "asesoría legal": AsesoriaImg,
  "asesoria legal": AsesoriaImg,
  "asesoría": AsesoriaImg,
  "asesoria": AsesoriaImg,
  "legal": AsesoriaImg,
  
  // Carpintería
  "carpintería": CarpinteroImg,
  "carpinteria": CarpinteroImg,
  "carpintero": CarpinteroImg,
  
  // Cerrajería
  "cerrajería": CerrajeroImg,
  "cerrajeria": CerrajeroImg,
  "cerrajero": CerrajeroImg,
  
  // Clases Particulares
  "clases particulares": ClasesImg,
  "clases": ClasesImg,
  "tutoría": ClasesImg,
  "tutoria": ClasesImg,
  "tutorías": ClasesImg,
  "tutorias": ClasesImg,
  "educación": ClasesImg,
  "educacion": ClasesImg,
  
  // Cocina
  "cocina": CocinaImg,
  "chef": CocinaImg,
  "cocinero": CocinaImg,
  
  // Conducción
  "conducción": ConduccionImg,
  "conduccion": ConduccionImg,
  "chofer": ConduccionImg,
  "conductor": ConduccionImg,
  
  // Cuidado de Adultos Mayores
  "cuidado de adultos mayores": CuidadoAdultosImg,
  "cuidado adultos": CuidadoAdultosImg,
  "adultos mayores": CuidadoAdultosImg,
  "cuidado de ancianos": CuidadoAdultosImg,
  
  // Cuidado de Niños
  "cuidado de niños": CuidadoNiñosImg,
  "cuidado de ninos": CuidadoNiñosImg,
  "cuidado niños": CuidadoNiñosImg,
  "cuidado ninos": CuidadoNiñosImg,
  "niñera": CuidadoNiñosImg,
  "ninera": CuidadoNiñosImg,
  "babysitter": CuidadoNiñosImg,
  
  // Electricidad
  "electricidad": ElectricistaImg,
  "electricista": ElectricistaImg,
  "instalaciones eléctricas": ElectricistaImg,
  "instalaciones electricas": ElectricistaImg,
  
  // Electrónica
  "electrónica": ElectronicaImg,
  "electronica": ElectronicaImg,
  "reparación electrónica": ElectronicaImg,
  "reparacion electronica": ElectronicaImg,
  "técnico it": ElectronicaImg,
  "tecnico it": ElectronicaImg,
  "tecnico": ElectronicaImg,
  
  // Entrenador Personal
  "entrenador personal": EntrenadorPersonalImg,
  "entrenador": EntrenadorPersonalImg,
  "personal trainer": EntrenadorPersonalImg,
  "fitness": EntrenadorPersonalImg,
  "gimnasio": EntrenadorPersonalImg,
  
  // Estética
  "estética": EsteticaImg,
  "estetica": EsteticaImg,
  "belleza": EsteticaImg,
  "uñas": EsteticaImg,
  "unas": EsteticaImg,
  "manicure": EsteticaImg,
  "pedicure": EsteticaImg,
  
  // Fontanería
  "fontanería": FontaneriaImg,
  "fontaneria": FontaneriaImg,
  "fontanero": FontaneriaImg,
  
  // Plomería
  "plomería": PlomeroImg,
  "plomeria": PlomeroImg,
  "plomero": PlomeroImg,
  
  // Fotografía
  "fotografía": FotografoImg,
  "fotografia": FotografoImg,
  "fotógrafo": FotografoImg,
  "fotografo": FotografoImg,
  "foto": FotografoImg,
  
  // Jardinería
  "jardinería": JardineroImg,
  "jardineria": JardineroImg,
  "jardinero": JardineroImg,
  "paisajismo": JardineroImg,
  
  // Limpieza
  "limpieza": LimpiezaImg,
  "limpieza profunda": LimpiezaProfundaImg,
  "limpieza general": LimpiezaImg,
  "aseo": LimpiezaImg,
  
  // Mudanza
  "mudanza": MudanzaImg,
  "mudanzas": MudanzaImg,
  "traslado": MudanzaImg,
  
  // Pintura
  "pintura": PintorImg,
  "pintor": PintorImg,
  "pintor de casas": PintorImg,
  
  // Refrigeración
  "refrigeración": RefrigeracionImg,
  "refrigeracion": RefrigeracionImg,
  "aire acondicionado": RefrigeracionImg,
  "climatización": RefrigeracionImg,
  "climatizacion": RefrigeracionImg,
};

/**
 * Normaliza el nombre de una categoría para hacer matching
 * - Convierte a minúsculas
 * - Elimina acentos
 * - Elimina espacios extra
 */
function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .trim();
}

/**
 * Obtiene la imagen para una categoría por su nombre
 * @param categoryName - Nombre de la categoría
 * @returns URL de la imagen o null si no se encuentra
 */
export function getCategoryImage(categoryName: string | null | undefined): string | null {
  if (!categoryName) return null;
  
  const normalized = normalizeCategoryName(categoryName);
  return categoryImageMap[normalized] || null;
}

/**
 * Obtiene la imagen para una categoría con fallback
 * Si no encuentra la imagen, retorna null para que se use el placeholder
 * @param categoryName - Nombre de la categoría
 * @returns URL de la imagen o null
 */
export function getCategoryImageWithFallback(categoryName: string | null | undefined): string | null {
  return getCategoryImage(categoryName);
}

/**
 * Lista todas las imágenes disponibles (útil para debugging)
 */
export function getAllCategoryImages(): Record<string, string> {
  return categoryImageMap;
}

