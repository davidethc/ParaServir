import { useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

interface SearchOption {
  id: string;
  name: string;
}

interface SearchBarProps {
  /**
   * Placeholder para el input de búsqueda
   */
  searchPlaceholder?: string;
  /**
   * Placeholder para el selector de categoría
   */
  categoryPlaceholder?: string;
  /**
   * Opciones de categorías para el selector
   */
  categories?: SearchOption[];
  /**
   * Estado de carga de categorías
   */
  loadingCategories?: boolean;
  /**
   * Búsquedas populares (tags)
   */
  popularSearches?: string[];
  /**
   * Callback cuando se envía el formulario
   */
  onSearch: (query: string, categoryId?: string) => void;
  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Barra de búsqueda unificada y reutilizable
 * Usada en DashboardHomePage y otras páginas que requieren búsqueda
 */
export function SearchBar({
  searchPlaceholder = "¿Qué trabajo estás buscando?",
  categoryPlaceholder = "Seleccionar Categoría",
  categories = [],
  loadingCategories = false,
  popularSearches = [],
  onSearch,
  className,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedCategory || undefined);
  };

  const handlePopularSearch = (search: string) => {
    setSearchQuery(search);
    // Trigger search inmediatamente
    onSearch(search, selectedCategory || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          disabled={loadingCategories}
        >
          <SelectTrigger className="w-full md:w-64 h-12 border-gray-300 focus:border-blue-500">
            <SelectValue
              placeholder={
                loadingCategories ? "Cargando..." : categoryPlaceholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Buscar
        </Button>
      </div>

      {/* Búsquedas populares */}
      {popularSearches.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Búsquedas Populares:</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePopularSearch(search)}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
