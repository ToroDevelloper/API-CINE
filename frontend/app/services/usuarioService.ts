import { apiFetch } from "./apiClient";

const API_URL = "/api/usuarios";

export type Usuario = {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  activo: boolean;
  telefono?: string;
  fecha_registro?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await apiFetch<ApiResponse<Usuario[]>>(API_URL);
  return response?.data ?? [];
};

export const getUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiFetch<ApiResponse<Usuario>>(`${API_URL}/${id}`);
  return response?.data;
};

export const updateUsuario = async (id: string, data: Partial<Usuario>): Promise<Usuario> => {
  const response = await apiFetch<ApiResponse<Usuario>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return response?.data;
};

export const deleteUsuario = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};
