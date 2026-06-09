import { apiFetch } from "./apiClient";

export type Pelicula = {
  _id: string;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  idioma: string;
  clasificacion: string;
  fecha_estreno: string;
  poster_url?: string;
  generos?: string[];
};

export type Funcion = {
  _id: string;
  pelicula_id: string | { _id: string; titulo?: string };
  sala_id: { _id: string; nombre: string; tipo?: string } | string;
  fecha_hora: string;
  precio_base: number;
  idioma: "español" | "subtitulada" | "doblada";
  formato: "2D" | "3D" | "IMAX" | "4DX";
  activa: boolean;
};

export type AsientoDisponible = {
  _id: string;
  sala_id: string;
  fila: string;
  numero: number;
  tipo: string;
  disponible: boolean;
};

export type Reserva = {
  _id: string;
  estado: "pendiente" | "confirmada" | "cancelada";
  total: number;
  fecha_reserva?: string;
  funcion_id?: {
    _id: string;
    fecha_hora: string;
    precio_base: number;
    pelicula_id?: {
      _id: string;
      titulo: string;
      poster_url?: string;
      duracion_min?: number;
    };
    sala_id?: {
      _id: string;
      nombre: string;
      tipo?: string;
    };
  };
  asientos_ids?: Array<{
    _id: string;
    fila: string;
    numero: number;
    tipo?: string;
  }>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
};

export async function getPeliculas(): Promise<Pelicula[]> {
  const res = await apiFetch<ApiResponse<Pelicula[]>>("/api/peliculas");
  return res.data ?? [];
}

export async function getFuncionesPorPelicula(peliculaId: string): Promise<Funcion[]> {
  const res = await apiFetch<ApiResponse<Funcion[]>>(`/api/funciones/pelicula/${peliculaId}`);
  return res.data ?? [];
}

export async function getAsientosDisponibles(funcionId: string): Promise<AsientoDisponible[]> {
  const res = await apiFetch<ApiResponse<AsientoDisponible[]>>(
    `/api/reservas/asientos-disponibles/${funcionId}`
  );
  return res.data ?? [];
}

export async function getMisReservas(): Promise<Reserva[]> {
  const res = await apiFetch<ApiResponse<Reserva[]>>("/api/reservas/mis-reservas");
  return res.data ?? [];
}

export async function crearReserva(params: {
  funcion_id: string;
  asientos_ids: string[];
}): Promise<Reserva> {
  const res = await apiFetch<ApiResponse<Reserva>>("/api/reservas", {
    method: "POST",
    json: params,
  });
  return res.data;
}

export async function cancelarReserva(reservaId: string): Promise<void> {
  await apiFetch<ApiResponse<unknown>>(`/api/reservas/${reservaId}`, {
    method: "DELETE",
  });
}
