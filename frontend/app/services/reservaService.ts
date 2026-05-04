import { apiFetch } from "./apiClient";

const API_URL = "/api/reservas";

export const getReservas = async () => {
  const response = await apiFetch<any>(API_URL);
  return response?.data ?? response;
};

export const getMisReservas = async () => {
  const response = await apiFetch<any>(`${API_URL}/mis-reservas`);
  return response?.data ?? response;
};

export const getReserva = async (id: string) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`);
  return response?.data ?? response;
};

export const createReserva = async (data: any) => {
  const response = await apiFetch<any>(API_URL, { method: "POST", json: data });
  return response?.data ?? response;
};

export const updateReserva = async (id: string, data: any) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return response?.data ?? response;
};

export const cancelarReserva = async (id: string) => {
  const response = await apiFetch<any>(`${API_URL}/${id}`, { method: "DELETE" });
  return response?.data ?? response;
};

export const getAsientosDisponibles = async (funcionId: string) => {
  const response = await apiFetch<any>(`${API_URL}/asientos-disponibles/${funcionId}`);
  return response?.data ?? response;
};
