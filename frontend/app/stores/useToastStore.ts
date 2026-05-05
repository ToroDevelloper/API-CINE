import { create } from "zustand";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
};

type ToastInput = {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  addToast: (toast: ToastInput) => string;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = toast.duration || 4000;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, duration, id }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function useAppToast() {
  const addToast = useToastStore((s) => s.addToast);
  return { addToast };
}
