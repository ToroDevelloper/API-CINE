import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { 
  Home, 
  Film, 
  Ticket, 
  Users, 
  DoorOpen, 
  Armchair, 
  Calendar, 
  Utensils, 
  ClipboardList, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut, 
  Star 
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const isActive = (path?: string) => path ? location.pathname === path : false;

  const menuItems = [
    { path: "/dashboard", label: "Inicio", icon: Home, enabled: true },
    { path: "/dashboard/peliculas", label: "Películas", icon: Film, enabled: true },
    { path: "/dashboard/reservas", label: "Reservas", icon: Ticket, enabled: true },
    { label: "Usuarios", icon: Users, enabled: false },
    { label: "Salas", icon: DoorOpen, enabled: false },
    { label: "Asientos", icon: Armchair, enabled: false },
    { label: "Funciones", icon: Calendar, enabled: false },
    { label: "Snacks", icon: Utensils, enabled: false },
    { label: "Pedidos de Snacks", icon: ClipboardList, enabled: false },
    { label: "Pagos", icon: Wallet, enabled: false },
    { label: "Resumen", icon: BarChart3, enabled: false },
  ];

  const handleLogout = () => {
    void logout();
    navigate("/", { replace: true });
  };

  return (
    <aside 
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[256px] bg-[#0A0A0A] border-r border-[#18181B] flex flex-col z-[40] transition-all duration-300"
      style={{ boxSizing: "border-box" }}
    >
      {/* Profile Header - Matched with Navbar Style */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#27272A] border border-[#3F3F46] text-white font-bold text-sm shadow-md">
          {user?.nombre?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white truncate leading-tight">
            {user?.nombre}
          </span>
          <span className="text-[10px] font-bold text-[#52525B] tracking-wider uppercase">
            SYSTEM CONTROLLER
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          const content = (
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${
              active
                ? "bg-[#18181B] text-white shadow-inner"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#18181B]/50"
            } ${!item.enabled ? "cursor-default opacity-80" : "cursor-pointer"}`}>
              {/* Active Indicator Bar */}
              {active && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#E11D48] rounded-r-full shadow-[0_0_10px_rgba(225,29,72,0.4)]"></div>
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-white" : "text-[#71717A] group-hover:text-white"}`} />
              <span className={`text-[14px] ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </div>
          );

          if (item.enabled && item.path) {
            return (
              <Link key={index} to={item.path} className="block">
                {content}
              </Link>
            );
          }

          return <div key={index} className="block">{content}</div>;
        })}
      </nav>

      {/* Bottom Section Divider */}
      <div className="mx-6 h-px bg-[#18181B] my-2 opacity-50"></div>

      {/* Footer Navigation */}
      <div className="px-3 pb-4 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#18181B]/50 cursor-default group transition-all">
          <Settings className="w-5 h-5 text-[#71717A] group-hover:text-white" />
          <span className="text-[14px] font-medium">Configuración</span>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#18181B]/50 transition-all duration-200 cursor-pointer group"
        >
          <LogOut className="w-5 h-5 text-[#71717A] group-hover:text-white" />
          <span className="text-[14px] font-medium">Cerrar Sesión</span>
        </button>
      </div>

      {/* Premium Card */}
      <div className="p-4 bg-[#0A0A0A] border-t border-[#18181B]">
        <div className="p-4 bg-[#0F0F0F] border border-[#18181B] rounded-xl space-y-3 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#E11D48]">
              <div className="w-5 h-5 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase">PREMIUM</span>
            </div>
            <p className="text-[12px] text-[#71717A] leading-tight font-medium">
              Acceso a películas exclusivas y sin límites
            </p>
          </div>
          <button className="w-full py-2.5 bg-[#E11D48] hover:bg-[#F43F5E] active:scale-[0.98] text-white text-[13px] font-bold rounded-lg transition-all shadow-md shadow-red-900/10">
            Actualizar
          </button>
        </div>
      </div>
    </aside>
  );
}
