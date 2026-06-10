import React from "react";
import { ToastContainer } from "./Notifications";
import { useToastStore, useAppToast } from "../stores/useToastStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useCartStore } from "../stores/useCartStore";

export { useAppToast };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    function onUnauthorized(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
      useCartStore.getState().clearCart();
      addToast({
        type: "warning",
        title: "Sesion expirada",
        description: detail?.message ?? "Inicia sesion nuevamente.",
      });
    }

    function onForbidden(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      addToast({
        type: "error",
        title: "Acceso denegado",
        description: detail?.message ?? "No tienes permisos para esta accion.",
      });
    }

    window.addEventListener("api:unauthorized", onUnauthorized);
    window.addEventListener("api:forbidden", onForbidden);
    return () => {
      window.removeEventListener("api:unauthorized", onUnauthorized);
      window.removeEventListener("api:forbidden", onForbidden);
    };
  }, [addToast]);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default ToastProvider;
