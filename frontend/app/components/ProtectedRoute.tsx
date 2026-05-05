import { useMemo } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-text-muted">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.rol !== "admin") {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-[2px] bg-[rgba(229,9,20,0.1)] border border-[#E50914] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#E50914]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-text-heading">
            Acceso Denegado
          </h2>
          <p className="text-[14px] text-text-muted max-w-[320px]">
            No tienes permisos para acceder a esta sección. Esta funcionalidad
            está reservada para administradores.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-[16px] py-[8px] bg-[#E50914] hover:bg-[#c0000c] text-white text-[14px] font-bold rounded-[2px] transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
