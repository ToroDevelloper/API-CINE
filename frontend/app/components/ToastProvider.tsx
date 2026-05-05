import React from "react";
import { ToastContainer } from "./Notifications";
import { useToastStore, useAppToast } from "../stores/useToastStore";

export { useAppToast };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default ToastProvider;
