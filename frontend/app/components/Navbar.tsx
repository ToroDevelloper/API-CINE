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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-xl border-b border-border-base/50 transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-6 lg:px-16 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-red rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(225,29,72,0.3)]">
            C
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-main">
            INEMA
          </span>
        </Link>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-text-dim hover:text-text-main transition-colors text-sm font-medium"
              >
                Inicio
              </Link>
              <Link
                to="/dashboard/peliculas"
                className="text-text-dim hover:text-text-main transition-colors text-sm font-medium"
              >
                Películas
              </Link>
              <Link
                to="/dashboard/reservas"
                className="text-text-dim hover:text-text-main transition-colors text-sm font-medium"
              >
                Reservas
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-text-dim hover:text-text-main transition-colors text-sm font-medium"
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
              <button className="relative w-10 h-10 rounded-lg bg-bg-card border border-border-base hover:border-primary-red flex items-center justify-center transition-all text-text-dim hover:text-text-main">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-red rounded-full border-2 border-bg-main"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-card border border-border-base hover:border-primary-red transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-bg-main border border-border-base flex items-center justify-center text-text-main font-bold text-sm transition-colors">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold text-text-main transition-colors">
                      {user?.nombre}
                    </span>
                    <span className="text-[10px] text-text-dim font-bold uppercase tracking-tight transition-colors">System Controller</span>
                  </div>
                  <span className="text-text-dim text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-bg-card border border-border-base rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border-base">
                      <p className="text-sm font-semibold text-text-main">{user?.nombre}</p>
                      <p className="text-xs text-text-dim">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-text-dim hover:bg-bg-main hover:text-text-main transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <Link
                        to="/dashboard/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-text-dim hover:bg-bg-main hover:text-text-main transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>
                    </div>
                    <div className="border-t border-border-base p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-primary-red hover:bg-bg-main transition-colors font-medium flex items-center gap-2"
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
                className="text-text-dim hover:text-text-main transition-colors text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-primary-red hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_20px_rgba(225,29,72,0.5)]"
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
