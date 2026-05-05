import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useState, useEffect } from "react";
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
  Settings,
  LogOut,
  Crown,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

type MenuItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
};

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.rol === "admin";

  const isActive = (path?: string) => path ? location.pathname === path : false;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const allMenuItems: MenuItem[] = [
    { path: "/dashboard", label: "Inicio", icon: Home },
    { path: "/dashboard/peliculas", label: "Películas", icon: Film },
    { path: "/dashboard/reservas", label: "Reservas", icon: Ticket },
    { path: "/dashboard/usuarios", label: "Usuarios", icon: Users, requiresAdmin: true },
    { path: "/dashboard/salas", label: "Salas", icon: DoorOpen, requiresAdmin: true },
    { path: "/dashboard/asientos", label: "Asientos", icon: Armchair, requiresAdmin: true },
    { path: "/dashboard/funciones", label: "Funciones", icon: Calendar, requiresAdmin: true },
    { path: "/dashboard/snacks", label: "Snacks", icon: Utensils },
    { path: "/dashboard/pedidos", label: "Pedidos de Snacks", icon: ClipboardList, requiresAdmin: true },
    { path: "/dashboard/pagos", label: "Pagos", icon: Wallet, requiresAdmin: true },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.requiresAdmin || isAdmin
  );

  const handleLogout = () => {
    void logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const sidebarContent = (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-border-base">
          <div className="flex items-center gap-3">
            <div className="w-[36px] h-[36px] rounded-[2px] bg-bg-main border border-border-base flex items-center justify-center text-text-main font-bold text-[14px]">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold text-text-heading truncate leading-tight">
                API-CINE {isAdmin ? "Admin" : "User"}
              </span>
              <span className="text-[10px] font-bold text-text-dim tracking-[0.1em] uppercase">
                {isAdmin ? "SYSTEM CONTROLLER" : "MOVIE LOVER"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-[4px]">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path} className="block">
                <div
                  className={`flex items-center gap-[12px] px-[10px] py-[8px] rounded-[2px] transition-all duration-200 ${
                    active
                      ? "bg-[rgba(39,39,42,0.4)] border-l-[4px] border-l-[#E50914] text-text-main pl-[14px]"
                      : "text-text-muted hover:text-text-main hover:bg-[#18181B]/50 border-l-[4px] border-l-transparent"
                  } cursor-pointer`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? "text-text-main" : "text-text-dim"}`} />
                  <span className={`text-[14px] ${active ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mx-6 h-px bg-border-base my-2"></div>

        <div className="px-3 pb-4 space-y-[4px]">
          <div className="flex items-center gap-[12px] px-[10px] py-[8px] rounded-[2px] text-text-muted hover:text-text-main hover:bg-[#18181B]/50 cursor-pointer transition-all">
            <Settings className="w-[18px] h-[18px] text-text-dim" />
            <span className="text-[14px] font-medium">Configuración</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-[12px] px-[10px] py-[8px] rounded-[2px] text-text-muted hover:text-text-main hover:bg-[#18181B]/50 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] text-text-dim" />
            <span className="text-[14px] font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-bg-side border-t border-border-base">
        {!isAdmin && (
          <div className="p-4 bg-[rgba(24,24,27,0.5)] border border-[#27272A] rounded-[4px] space-y-3 mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-[8px]">
                <div className="w-[18px] h-[18px] rounded-[2px] bg-[#27272A] flex items-center justify-center">
                  <Crown className="w-[12px] h-[12px] text-[#E50914] fill-current" />
                </div>
                <span className="text-[10px] font-black tracking-[0.1em] uppercase text-text-heading">
                  PREMIUM
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-[1.4]">
                Acceso a películas exclusivas y sin límites
              </p>
            </div>
            <button className="w-full py-[8px] bg-[#E50914] hover:bg-[#c0000c] active:scale-[0.98] text-white text-[11px] font-bold rounded-[2px] transition-all">
              Actualizar
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-[12px] px-[10px] py-[8px] rounded-[2px] text-text-muted hover:text-text-main hover:bg-[#18181B]/50 transition-all cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px] text-text-dim" /> : <Moon className="w-[18px] h-[18px] text-text-dim" />}
          <span className="text-[14px] font-medium">{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-[72px] left-3 z-[60] w-10 h-10 rounded-[2px] bg-bg-side border border-border-base flex items-center justify-center text-text-main"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:flex fixed left-0 top-[64px] h-[calc(100vh-64px)] w-[256px] bg-bg-side border-r border-border-base flex-col z-[40]">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar - overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[280px] h-full bg-bg-side border-r border-border-base flex flex-col animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
