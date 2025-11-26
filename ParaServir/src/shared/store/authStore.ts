import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../../infrastructure/http/services/AuthService';
import type { RegisterUserDTO } from '../../application/dto/RegisterUserDTO';
import type { LoginDTO } from '../../application/dto/LoginDTO';
import type { AuthResponseDTO } from '../../application/dto/AuthResponseDTO';

interface AuthState {
  user: {
    userId: string | null;
    role: string | null;
    token: string | null;
  };
  loading: boolean;
  error: string | null;
  register: (dto: RegisterUserDTO) => Promise<AuthResponseDTO | null>;
  login: (dto: LoginDTO) => Promise<AuthResponseDTO | null>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        userId: authService.getUserId(),
        role: authService.getRole(),
        token: authService.getToken(),
      },
      loading: false,
      error: null,

      register: async (dto: RegisterUserDTO) => {
        set({ loading: true, error: null });
        try {
          const result = await authService.register(dto);
          set({
            user: {
              userId: result.userId,
              role: result.role,
              token: result.token,
            },
            loading: false,
          });
          return result;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al registrar usuario';
          set({ error: message, loading: false });
          return null;
        }
      },

      login: async (dto: LoginDTO) => {
        set({ loading: true, error: null });
        try {
          const result = await authService.login(dto);
          set({
            user: {
              userId: result.userId,
              role: result.role,
              token: result.token,
            },
            loading: false,
          });
          return result;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
          set({ error: message, loading: false });
          return null;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authService.logout();
          set({
            user: {
              userId: null,
              role: null,
              token: null,
            },
            loading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
          set({ error: message, loading: false });
        }
      },

      isAuthenticated: () => {
        return authService.isAuthenticated();
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

