import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

/**
 * Layout del Dashboard
 * - Protege todas las rutas hijas
 * - Valida autenticación en el servidor si es necesario
 * - Proporciona estructura fija: Navbar + Sidebar
 * - Mantiene componentes fijos mientras <Outlet /> cambia el contenido
 */
export default function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Si no está autenticado, no renderizar nada (será redirigido)
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      {/* Navbar fijo en todas las páginas del dashboard */}
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar fijo con navegación del dashboard */}
        <Sidebar />
        
        {/* Contenido principal que cambia con las rutas */}
        <main className="flex-1 ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
