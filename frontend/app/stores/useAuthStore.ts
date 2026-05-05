import { create } from "zustand";
import { apiFetch } from "../services/apiClient";

export type AuthUser = {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    set({ isLoading: true });
    try {
      const response = await apiFetch<ApiResponse<AuthUser>>("/api/auth/me");
      const user = response?.data ?? null;
      set({ user, isAuthenticated: !!user });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiFetch<ApiResponse<AuthUser>>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });

      const user = response?.data ?? null;
      set({ user, isAuthenticated: !!user });
      return !!user;
    } catch (e) {
      set({ user: null, isAuthenticated: false });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiFetch<ApiResponse<unknown>>("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
