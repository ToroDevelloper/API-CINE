import { apiFetch } from "./apiClient";

export interface Pelicula {
  _id: string;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  idioma: string;
  clasificacion: string;
  fecha_estreno: string;
  poster_url?: string;
  genero?: string[];
}

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export async function getPeliculas(): Promise<Pelicula[]> {
  const res = await apiFetch<ApiResponse<Pelicula[]>>("/api/peliculas");
  return res?.data ?? [];
}

