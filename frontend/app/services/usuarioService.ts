import { apiFetch } from "./apiClient";

const API_URL = "/api/usuarios";

export const getUsuarios = async () => {
  const response = await apiFetch<any>(API_URL);
  return response?.data ?? response;
};

export const getUsuario = async (id: string) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`);
  return response?.data ?? response;
};

export const updateUsuario = async (id: string, data: any) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return response?.data ?? response;
};

export const deleteUsuario = async (id: string) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`, { method: "DELETE" });
  return response?.data ?? response;
};
