import React, { createContext, useContext } from "react";
import { ToastContainer, useToast } from "./Notifications";

type ToastInput = {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
};

const ToastContext = createContext<{
  addToast: (t: ToastInput) => string;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, addToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within ToastProvider");
  }
  return ctx;
}

export default ToastProvider;
