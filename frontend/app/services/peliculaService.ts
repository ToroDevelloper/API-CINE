const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getPeliculas(): Promise<Pelicula[]> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/peliculas`);
    if (!response.ok) throw new Error("Error al obtener películas");
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching películas:", error);
    return [];
  }
}
