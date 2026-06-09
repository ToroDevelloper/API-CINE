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

export type FuncionPopulatedPelicula = {
  _id: string;
  titulo: string;
  poster_url?: string;
  duracion_min?: number;
};

export type SalaPopulated = {
  _id: string;
  nombre: string;
  tipo?: string;
};

export type Funcion = {
  _id: string;
  pelicula_id: string | FuncionPopulatedPelicula;
  sala_id: string | SalaPopulated;
  fecha_hora: string;
  precio_base: number;
  idioma: string;
  formato: string;
  activa: boolean;
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

export type Usuario = {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  activo: boolean;
  telefono?: string;
  fecha_registro?: string;
};

export type Pago = {
  _id: string;
  reserva_id: string;
  monto: number;
  metodo: string;
  estado: string;
  fecha_pago?: string;
};

export type Snack = {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  disponible: boolean;
};

export type Sala = {
  _id: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  activa: boolean;
};

export type Asiento = {
  _id: string;
  sala_id: string;
  fila: string;
  numero: number;
  tipo: string;
  disponible: boolean;
};

export type PedidoSnack = {
  _id: string;
  reserva_id: string;
  snacks: Array<{
    snack_id: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
};

export type AuthUser = {
  _id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
};

export type CreateReservaParams = {
  funcion_id: string;
  asientos_ids: string[];
};

export type CreatePedidoParams = {
  reserva_id: string;
  snacks: Array<{ snack_id: string; cantidad: number }>;
};
