import { useState } from "react";
import type { FormEvent } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
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
  /**
   * Variante del diseño (default, hero)
   */
  variant?: "default" | "hero";
}

/**
 * Barra de búsqueda profesional y moderna
 * Diseño tipo marketplace con mejor UX y visual atractivo
 */
export function SearchBar({
  searchPlaceholder = "¿Qué trabajo estás buscando?",
  categoryPlaceholder = "Todas las categorías",
  categories = [],
  loadingCategories = false,
  popularSearches = [],
  onSearch,
  className,
  variant = "default",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory) {
      onSearch(searchQuery.trim(), selectedCategory || undefined);
    }
  };

  const handlePopularSearch = (search: string) => {
    setSearchQuery(search);
    onSearch(search, selectedCategory || undefined);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (selectedCategory) {
      onSearch("", selectedCategory);
    }
  };

  const isHero = variant === "hero";

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Barra de búsqueda principal */}
        <div
          className={cn(
            "relative flex flex-col md:flex-row gap-2",
            "bg-card rounded-xl border-2 transition-all duration-200",
            isFocused
              ? "border-primary shadow-lg shadow-primary/10"
              : "border-border shadow-md hover:shadow-lg",
            isHero && "shadow-xl"
          )}
        >
          {/* Input de búsqueda */}
          <div className="flex-1 relative">
            <Search
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                isFocused ? "text-primary" : "text-muted-foreground",
                "w-5 h-5"
              )}
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "pl-12 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "h-14 md:h-16 text-base",
                "bg-transparent"
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Separador visual */}
          <div className="hidden md:block w-px bg-border self-stretch my-2" />

          {/* Selector de categoría */}
          <div className="md:w-64">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={loadingCategories}
            >
              <SelectTrigger
                className={cn(
                  "h-14 md:h-16 border-0 focus:ring-0 bg-transparent",
                  "text-base font-medium"
                )}
              >
                <SelectValue
                  placeholder={
                    loadingCategories ? "Cargando..." : categoryPlaceholder
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No hay categorías disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Botón de búsqueda */}
          <Button
            type="submit"
            size="lg"
            className={cn(
              "h-14 md:h-16 px-6 md:px-8 rounded-r-xl md:rounded-l-none rounded-l-xl md:rounded-r-xl",
              "bg-primary hover:bg-primary-hover text-primary-foreground",
              "font-semibold text-base shadow-sm",
              "transition-all duration-200 hover:shadow-md"
            )}
            disabled={!searchQuery.trim() && !selectedCategory}
          >
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Buscar</span>
          </Button>
        </div>

        {/* Búsquedas populares */}
        {popularSearches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Búsquedas populares:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(
                    "px-4 py-1.5 cursor-pointer transition-all duration-200",
                    "hover:bg-primary hover:text-primary-foreground",
                    "hover:scale-105 font-medium text-sm",
                    "border border-border hover:border-primary"
                  )}
                  onClick={() => handlePopularSearch(search)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePopularSearch(search);
                    }
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
