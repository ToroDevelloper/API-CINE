import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import { useState } from "react";
import { Home, Film, Ticket, Settings, LogOut, Star } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "Inicio", icon: Home },
    { path: "/dashboard/peliculas", label: "Películas", icon: Film },
    { path: "/dashboard/reservas", label: "Reservas", icon: Ticket },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#131313] border-r border-[#333] flex flex-col">
      {/* Profile Header */}
      <div className="p-6 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#E50914] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(229,9,20,0.3)]">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#e9bcb6] font-medium uppercase tracking-wider">Bienvenido</p>
            <p className="text-sm font-bold text-[#e2e2e2] truncate">{user?.nombre}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                active
                  ? "bg-[#1f1f1f] text-white border-l-2 border-[#E50914]"
                  : "text-[#e9bcb6] hover:text-[#e2e2e2] hover:bg-[#1f1f1f]"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E50914] rounded-r-lg"></div>
              )}

              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[#E50914]" : ""}`} />
              <span className="font-semibold text-sm flex-1">{item.label}</span>

              {/* Indicator dot */}
              {active && (
                <div className="w-2 h-2 bg-[#E50914] rounded-full shadow-[0_0_8px_rgba(229,9,20,0.5)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 py-2">
        <div className="h-px bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>
      </div>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-[#333] space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#e9bcb6] hover:text-[#e2e2e2] hover:bg-[#1f1f1f] transition-all duration-200 group">
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Configuración</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#E50914] hover:bg-[#1f1f1f] transition-all duration-200 font-medium group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>

      {/* Promotional Banner */}
      <div className="m-4 p-4 bg-[#1f1f1f] border border-[#333] rounded-lg">
        <p className="text-xs font-bold text-[#E50914] mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#E50914]" />
            PREMIUM
          </p>
        <p className="text-xs text-[#e9bcb6] mb-3">Acceso a películas exclusivas y sin límites</p>
        <button className="w-full px-3 py-2 bg-[#E50914] hover:bg-[#c0000c] text-white text-xs font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(229,9,20,0.3)]">
          Actualizar
        </button>
      </div>
    </aside>
  );
}
