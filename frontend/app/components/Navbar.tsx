import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useState } from "react";
import { User, LogOut, Settings, Bell, Menu } from "lucide-react";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    void logout();
    setShowUserMenu(false);
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/80 backdrop-blur-md border-b border-[#333] transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-6 lg:px-16 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#E50914] rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(229,9,20,0.3)]">
            C
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            INEMA
          </span>
        </Link>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-[#e9bcb6] hover:text-white transition-colors text-sm font-medium"
              >
                Inicio
              </Link>
              <Link
                to="/dashboard/peliculas"
                className="text-[#e9bcb6] hover:text-white transition-colors text-sm font-medium"
              >
                Películas
              </Link>
              <Link
                to="/dashboard/reservas"
                className="text-[#e9bcb6] hover:text-white transition-colors text-sm font-medium"
              >
                Reservas
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-[#e9bcb6] hover:text-white transition-colors text-sm font-medium"
              >
                Inicio
              </Link>
            </>
          )}
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative w-10 h-10 rounded-lg bg-[#1f1f1f] border border-[#333] hover:border-[#E50914] flex items-center justify-center transition-all text-[#e9bcb6] hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E50914] rounded-full border-2 border-[#131313]"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#333] hover:border-[#E50914] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-sm">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold text-[#e2e2e2]">
                      {user?.nombre}
                    </span>
                    <span className="text-[10px] text-[#52525B] font-bold uppercase tracking-tight">System Controller</span>
                  </div>
                  <span className="text-[#e9bcb6] text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-[#1f1f1f] border border-[#333] rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#333]">
                      <p className="text-sm font-semibold text-[#e2e2e2]">{user?.nombre}</p>
                      <p className="text-xs text-[#e9bcb6]">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-[#e9bcb6] hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-[#e9bcb6] hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configuración
                      </button>
                    </div>
                    <div className="border-t border-[#333] p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-[#E50914] hover:bg-[#2a2a2a] transition-colors font-medium flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#e9bcb6] hover:text-white transition-colors text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:shadow-[0_0_20px_rgba(229,9,20,0.5)]"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
