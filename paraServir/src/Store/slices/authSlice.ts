import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AuthStorageService } from "@/shared/services/auth-storage.service";

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string; role: string };
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ id: string; email: string; role: string; token?: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;

      // Sincronizar automáticamente con localStorage si se proporciona token
      if (action.payload.token) {
        AuthStorageService.saveAuthData({
          token: action.payload.token,
          userId: action.payload.id,
          userEmail: action.payload.email,
          userRole: action.payload.role,
        });
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      
      // Limpiar localStorage automáticamente
      AuthStorageService.clearAuthData();
    },
    // Nueva acción para restaurar desde localStorage sin guardar de nuevo
    restoreAuth: (state, action: PayloadAction<{ id: string; email: string; role: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      // No guardar en localStorage porque ya está guardado
    },
  },
});

export const { login, logout, restoreAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
