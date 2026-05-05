import { apiFetch } from "./apiClient";

const API_URL = "/api/funciones";

export type Funcion = {
  _id: string;
  pelicula_id: { _id: string; titulo: string } | string;
  sala_id: { _id: string; nombre: string } | string;
  fecha_hora: string;
  precio_base: number;
  idioma: string;
  formato: string;
  activa: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getFunciones = async (): Promise<Funcion[]> => {
  const res = await apiFetch<ApiResponse<Funcion[]>>(API_URL);
  return res.data ?? [];
};

export const getFuncion = async (id: string): Promise<Funcion> => {
  const res = await apiFetch<ApiResponse<Funcion>>(`${API_URL}/${id}`);
  return res.data;
};

export const getFuncionesPorPelicula = async (peliculaId: string): Promise<Funcion[]> => {
  const res = await apiFetch<ApiResponse<Funcion[]>>(`${API_URL}/pelicula/${peliculaId}`);
  return res.data ?? [];
};

export const createFuncion = async (data: Omit<Funcion, "_id">): Promise<Funcion> => {
  const res = await apiFetch<ApiResponse<Funcion>>(API_URL, { method: "POST", json: data });
  return res.data;
};

export const updateFuncion = async (id: string, data: Partial<Funcion>): Promise<Funcion> => {
  const res = await apiFetch<ApiResponse<Funcion>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return res.data;
};

export const deleteFuncion = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};
