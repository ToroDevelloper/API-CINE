import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../../context/auth";
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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Si no está autenticado, no renderizar nada (será redirigido)
  if (!isAuthenticated) {
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
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
