import { apiFetch } from "./apiClient";

const API_URL = "/api/asientos";

export type Asiento = {
  _id: string;
  sala_id: { _id: string; nombre: string } | string;
  fila: string;
  numero: number;
  tipo: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getAsientosPorSala = async (salaId: string): Promise<Asiento[]> => {
  const res = await apiFetch<ApiResponse<Asiento[]>>(`${API_URL}/sala/${salaId}`);
  return res.data ?? [];
};

export const getAsiento = async (id: string): Promise<Asiento> => {
  const res = await apiFetch<ApiResponse<Asiento>>(`${API_URL}/${id}`);
  return res.data;
};

export const createAsiento = async (data: Omit<Asiento, "_id">): Promise<Asiento> => {
  const res = await apiFetch<ApiResponse<Asiento>>(API_URL, { method: "POST", json: data });
  return res.data;
};

export const updateAsiento = async (id: string, data: Partial<Asiento>): Promise<Asiento> => {
  const res = await apiFetch<ApiResponse<Asiento>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return res.data;
};

export const deleteAsiento = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};
