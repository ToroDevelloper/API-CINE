import { apiFetch } from "./apiClient";

const API_URL = "/api/snacks";

export type Snack = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string;
  disponible: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getSnacks = async (): Promise<Snack[]> => {
  const res = await apiFetch<ApiResponse<Snack[]>>(API_URL);
  return res.data ?? [];
};

export const getSnack = async (id: string): Promise<Snack> => {
  const res = await apiFetch<ApiResponse<Snack>>(`${API_URL}/${id}`);
  return res.data;
};

export const createSnack = async (data: Omit<Snack, "_id">): Promise<Snack> => {
  const res = await apiFetch<ApiResponse<Snack>>(API_URL, { method: "POST", json: data });
  return res.data;
};

export const updateSnack = async (id: string, data: Partial<Snack>): Promise<Snack> => {
  const res = await apiFetch<ApiResponse<Snack>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return res.data;
};

export const deleteSnack = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};
