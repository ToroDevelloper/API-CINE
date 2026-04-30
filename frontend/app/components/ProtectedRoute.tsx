import { Navigate } from "react-router";
import { useAuth } from "../context/auth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user" | "guest";
}

/**
 * ProtectedRoute - Componente middleware para rutas protegidas
 * 
 * Uso: Puede ser usado como componente envolvedor cuando necesitas
 * protección de ruta más granular o verificaciones de rol.
 * 
 * Para protección de layouts completos, usa DashboardLayout directamente.
 * 
 * @param children - Contenido a renderizar si está autenticado
 * @param requiredRole - Rol requerido (opcional)
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // No está autenticado: redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificación de rol (si se proporciona)
  if (requiredRole) {
    // TODO: Implementar verificación de roles según tu modelo de datos
    // const userRole = user?.role;
    // if (userRole !== requiredRole) {
    //   return <Navigate to="/dashboard" replace />;
    // }
  }

  return <>{children}</>;
}
