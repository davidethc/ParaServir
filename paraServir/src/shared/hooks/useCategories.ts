import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { loadCategories } from "@/Store/slices/categoriesSlice";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";

/**
 * Hook personalizado para manejar categorías de servicios
 * 
 * Características:
 * - Carga automática si no hay datos
 * - Caché automático de 5 minutos
 * - Manejo de loading y error
 * - Integrado con Redux
 * 
 * @param autoLoad - Si es true, carga automáticamente al montar (default: true)
 * @returns Objeto con categorías, loading, error y función de recarga
 */
export function useCategories(autoLoad: boolean = true) {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    if (autoLoad && categories.length === 0 && !loading) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void dispatch(loadCategories() as any);
    }
  }, [autoLoad, categories.length, loading, dispatch]);

  const reload = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void dispatch(loadCategories() as any);
  };

  return {
    categories,
    loading,
    error,
    reload,
  };
}

/**
 * Hook para obtener una categoría específica por ID
 */
export function useCategory(categoryId: string): ServiceCategoryDto | undefined {
  const { categories } = useSelector((state: RootState) => state.categories);
  return categories.find((cat) => cat.id === categoryId);
}
