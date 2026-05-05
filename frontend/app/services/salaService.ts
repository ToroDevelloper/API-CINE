import { apiFetch } from "./apiClient";

const API_URL = "/api/salas";

export type Sala = {
  _id: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  activa: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getSalas = async (): Promise<Sala[]> => {
  const res = await apiFetch<ApiResponse<Sala[]>>(API_URL);
  return res.data ?? [];
};

export const getSala = async (id: string): Promise<Sala> => {
  const res = await apiFetch<ApiResponse<Sala>>(`${API_URL}/${id}`);
  return res.data;
};

export const createSala = async (data: Omit<Sala, "_id">): Promise<Sala> => {
  const res = await apiFetch<ApiResponse<Sala>>(API_URL, { method: "POST", json: data });
  return res.data;
};

export const updateSala = async (id: string, data: Partial<Sala>): Promise<Sala> => {
  const res = await apiFetch<ApiResponse<Sala>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return res.data;
};

export const deleteSala = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};
