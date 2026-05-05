import { apiFetch } from "./apiClient";

const API_URL = "/api/pedidos-snacks";

export type PedidoSnack = {
  _id: string;
  usuario_id: { _id: string; nombre: string; email: string } | string;
  reserva_id?: { _id: string } | string;
  items: Array<{
    snack_id: { _id: string; nombre: string; precio: number } | string;
    cantidad: number;
    precio_unitario: number;
    subtotal?: number;
  }>;
  total: number;
  estado: string;
  fecha_pedido: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const getPedidosSnacks = async (): Promise<PedidoSnack[]> => {
  const res = await apiFetch<ApiResponse<PedidoSnack[]>>(API_URL);
  return res.data ?? [];
};

export const getMisPedidos = async (): Promise<PedidoSnack[]> => {
  const res = await apiFetch<ApiResponse<PedidoSnack[]>>(`${API_URL}/mis-pedidos`);
  return res.data ?? [];
};

export const getPedidoSnack = async (id: string): Promise<PedidoSnack> => {
  const res = await apiFetch<ApiResponse<PedidoSnack>>(`${API_URL}/${id}`);
  return res.data;
};

export const crearPedidoSnack = async (data: {
  reserva_id?: string;
  items: Array<{ snack_id: string; cantidad: number; precio_unitario: number; subtotal: number }>;
  total: number;
}): Promise<PedidoSnack> => {
  const res = await apiFetch<ApiResponse<PedidoSnack>>(API_URL, { method: "POST", json: data });
  return res.data;
};
