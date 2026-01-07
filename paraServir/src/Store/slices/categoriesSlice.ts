import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ServiceCategoryDto } from "@/modules/ServiceCategories/application/dto/service-category.dto";
import { ServiceCategoryController } from "@/modules/ServiceCategories/infra/http/controllers/service-category.controller";

interface CategoriesState {
  categories: ServiceCategoryDto[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null; // Timestamp de última carga
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  lastFetch: null,
};

// Tiempo de caché: 5 minutos (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Thunk para cargar categorías con caché automático
 * Solo hace la llamada API si:
 * - No hay categorías cargadas
 * - Han pasado más de 5 minutos desde la última carga
 */
export const loadCategories = createAsyncThunk(
  "categories/load",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { categories: CategoriesState };
    const { categories, lastFetch } = state.categories;

    // Si hay categorías y la caché es válida, no hacer llamada
    if (categories.length > 0 && lastFetch) {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetch;
      if (timeSinceLastFetch < CACHE_DURATION) {
        return categories; // Retornar datos en caché
      }
    }

    try {
      const controller = new ServiceCategoryController();
      const data = await controller.getAllCategories();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar categorías";
      return rejectWithValue(message);
    }
  }
);

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<ServiceCategoryDto[]>) => {
      state.categories = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.lastFetch = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCategories, clearCategories, clearError } = categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
