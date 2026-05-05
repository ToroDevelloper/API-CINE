import { create } from "zustand";
import type { AsientoDisponible } from "../services/cineService";
import type { Snack } from "../services/snackService";

export type CartAsiento = AsientoDisponible & {
  precio: number;
};

export type CartSnackItem = {
  snack: Snack;
  cantidad: number;
};

export type CartState = {
  funcionId: string | null;
  funcionInfo: {
    peliculaTitulo: string;
    salaNombre: string;
    fechaHora: string;
    precioBase: number;
    formato: string;
  } | null;
  asientos: CartAsiento[];
  snacks: CartSnackItem[];

  setFuncion: (funcionId: string, info: CartState["funcionInfo"]) => void;
  addAsiento: (asiento: CartAsiento) => void;
  removeAsiento: (asientoId: string) => void;
  toggleAsiento: (asiento: CartAsiento) => void;
  clearAsientos: () => void;
  addSnack: (snack: Snack) => void;
  removeSnack: (snackId: string) => void;
  updateSnackCantidad: (snackId: string, cantidad: number) => void;
  clearSnacks: () => void;
  clearCart: () => void;

  hasAsiento: (asientoId: string) => boolean;
  asientosCount: number;
  snacksCount: number;
  itemCount: number;
  subtotalAsientos: number;
  subtotalSnacks: number;
  total: number;
};

export const useCartStore = create<CartState>((set, get) => ({
  funcionId: null,
  funcionInfo: null,
  asientos: [],
  snacks: [],

  setFuncion: (funcionId, info) => {
    set({ funcionId, funcionInfo: info });
  },

  addAsiento: (asiento) => {
    set((state) => {
      if (state.asientos.some((a) => a._id === asiento._id)) return state;
      return { asientos: [...state.asientos, { ...asiento }] };
    });
  },

  removeAsiento: (asientoId) => {
    set((state) => ({
      asientos: state.asientos.filter((a) => a._id !== asientoId),
    }));
  },

  toggleAsiento: (asiento) => {
    set((state) => {
      const exists = state.asientos.some((a) => a._id === asiento._id);
      if (exists) {
        return { asientos: state.asientos.filter((a) => a._id !== asiento._id) };
      }
      return { asientos: [...state.asientos, { ...asiento }] };
    });
  },

  clearAsientos: () => {
    set({ asientos: [] });
  },

  addSnack: (snack) => {
    set((state) => {
      const existing = state.snacks.find((s) => s.snack._id === snack._id);
      if (existing) {
        return {
          snacks: state.snacks.map((s) =>
            s.snack._id === snack._id
              ? { ...s, cantidad: s.cantidad + 1 }
              : s
          ),
        };
      }
      return { snacks: [...state.snacks, { snack, cantidad: 1 }] };
    });
  },

  removeSnack: (snackId) => {
    set((state) => ({
      snacks: state.snacks.filter((s) => s.snack._id !== snackId),
    }));
  },

  updateSnackCantidad: (snackId, cantidad) => {
    if (cantidad <= 0) {
      get().removeSnack(snackId);
      return;
    }
    set((state) => ({
      snacks: state.snacks.map((s) =>
        s.snack._id === snackId ? { ...s, cantidad } : s
      ),
    }));
  },

  clearSnacks: () => {
    set({ snacks: [] });
  },

  clearCart: () => {
    set({
      funcionId: null,
      funcionInfo: null,
      asientos: [],
      snacks: [],
    });
  },

  hasAsiento: (asientoId) => {
    return get().asientos.some((a) => a._id === asientoId);
  },

  get asientosCount() {
    return get().asientos.length;
  },

  get snacksCount() {
    return get().snacks.reduce((sum, s) => sum + s.cantidad, 0);
  },

  get itemCount() {
    const state = get();
    return state.asientos.length + state.snacks.reduce((sum, s) => sum + s.cantidad, 0);
  },

  get subtotalAsientos() {
    return get().asientos.reduce((sum, a) => sum + a.precio, 0);
  },

  get subtotalSnacks() {
    return get().snacks.reduce((sum, s) => sum + s.snack.precio * s.cantidad, 0);
  },

  get total() {
    const state = get();
    return (
      state.asientos.reduce((sum, a) => sum + a.precio, 0) +
      state.snacks.reduce((sum, s) => sum + s.snack.precio * s.cantidad, 0)
    );
  },
}));

export function useCartTotals() {
  const asientos = useCartStore((s) => s.asientos);
  const snacks = useCartStore((s) => s.snacks);

  const subtotalAsientos = asientos.reduce((sum, a) => sum + a.precio, 0);
  const subtotalSnacks = snacks.reduce((sum, s) => sum + s.snack.precio * s.cantidad, 0);
  const total = subtotalAsientos + subtotalSnacks;
  const itemCount = asientos.length + snacks.reduce((sum, s) => sum + s.cantidad, 0);

  return { subtotalAsientos, subtotalSnacks, total, itemCount };
}
