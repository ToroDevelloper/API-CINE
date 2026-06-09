import { apiFetch } from "./apiClient";
import type { ApiResponse } from "../types";
import type { Reserva } from "../types";

export type { Reserva };

const API_URL = "/api/reservas";

type CreateReservaData = {
  funcion_id: string;
  asientos_ids: string[];
  snacks?: Array<{ snack_id: string; cantidad: number }>;
};

export const getReservas = async (): Promise<Reserva[]> => {
  const response = await apiFetch<ApiResponse<Reserva[]>>(API_URL);
  return response?.data ?? response as unknown as Reserva[];
};

export const getMisReservas = async (): Promise<Reserva[]> => {
  const response = await apiFetch<ApiResponse<Reserva[]>>(`${API_URL}/mis-reservas`);
  return response?.data ?? response as unknown as Reserva[];
};

export const getReserva = async (id: string): Promise<Reserva> => {
  const response = await apiFetch<ApiResponse<Reserva>>(`${API_URL}/${id}`);
  return response?.data ?? response as unknown as Reserva;
};

export const createReserva = async (data: CreateReservaData): Promise<Reserva> => {
  const response = await apiFetch<ApiResponse<Reserva>>(API_URL, { method: "POST", json: data });
  return response?.data ?? response as unknown as Reserva;
};

export const updateReserva = async (id: string, data: Partial<CreateReservaData>): Promise<Reserva> => {
  const response = await apiFetch<ApiResponse<Reserva>>(`${API_URL}/${id}`, { method: "PUT", json: data });
  return response?.data ?? response as unknown as Reserva;
};

export const cancelarReserva = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<unknown>>(`${API_URL}/${id}`, { method: "DELETE" });
};

export const getAsientosDisponibles = async (funcionId: string) => {
  const response = await apiFetch<ApiResponse<Reserva[]>>(`${API_URL}/asientos-disponibles/${funcionId}`);
  return response?.data ?? response as unknown as Reserva[];
};
