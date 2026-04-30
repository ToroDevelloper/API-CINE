import { Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar";

/**
 * Layout Público
 * Se usa para: home, login, register
 * - Muestra Navbar en todas las páginas públicas
 * - Permite desplazamiento completo de la página
 */
export default function PublicLayout() {
  const location = useLocation();
  
  // Determinar si mostrar Navbar (podría ocultarse en login/register si quieres)
  const showNavbar = true;

  return (
    <div className="min-h-screen bg-[#131313] text-white">
      {showNavbar && <Navbar />}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
