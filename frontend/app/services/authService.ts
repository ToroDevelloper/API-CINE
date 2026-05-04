import { apiFetch } from "./apiClient";

export const login = async (credentials: { email: string; password: string }) => {
  return apiFetch("/api/auth/login", {
    method: "POST",
    json: credentials,
  });
};

export const register = async (userData: { name: string; email: string; password: string }) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    json: userData,
  });
};

export const logout = async () => {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
};

export const getCurrentUser = async () => {
  return apiFetch("/api/auth/me");
};
