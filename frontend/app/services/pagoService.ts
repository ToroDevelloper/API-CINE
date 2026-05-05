import { apiFetch } from "./apiClient";

const API_URL = "/api/pagos";

export type Pago = {
  _id: string;
  usuario_id: { _id: string; nombre: string; email: string } | string;
  reserva_id?: { _id: string; funcion_id?: { pelicula_id?: { titulo: string } } } | string;
  monto: number;
  metodo_pago: string;
  estado: string;
  fecha_pago: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getPagos = async (): Promise<Pago[]> => {
  const res = await apiFetch<ApiResponse<Pago[]>>(API_URL);
  return res.data ?? [];
};

export const getMisPagos = async (): Promise<Pago[]> => {
  const res = await apiFetch<ApiResponse<Pago[]>>(`${API_URL}/mis-pagos`);
  return res.data ?? [];
};

export const getPago = async (id: string): Promise<Pago> => {
  const res = await apiFetch<ApiResponse<Pago>>(`${API_URL}/${id}`);
  return res.data;
};
