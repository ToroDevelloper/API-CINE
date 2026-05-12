import { Link, useLocation } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
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
  Crown,
  Shield,
  FileText,
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
    { path: "/dashboard/pagos", label: isAdmin ? "Pagos" : "Historial", icon: Wallet },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.requiresAdmin || isAdmin
  );

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

        <Link to="/dashboard/configuracion" className="block">
          <div className="flex items-center gap-[12px] px-[10px] py-[8px] rounded-[2px] text-text-muted hover:text-text-main hover:bg-[#18181B]/50 cursor-pointer transition-all">
            <Settings className="w-[18px] h-[18px] text-text-dim" />
            <span className="text-[14px] font-medium">Configuración</span>
          </div>
        </Link>
      </div>

      <div className="p-4 bg-bg-side border-t border-border-base space-y-3">
        <div className="p-3 bg-[rgba(229,9,20,0.05)] border border-[#27272A] rounded-[4px]">
          <div className="flex items-center gap-[8px] mb-2">
            <Shield className="w-[14px] h-[14px] text-[#E50914]" />
            <span className="text-[10px] font-black tracking-[0.1em] uppercase text-text-heading">
              Políticas
            </span>
          </div>
          <div className="space-y-1.5">
            <button className="w-full flex items-center gap-2 text-[11px] text-text-muted hover:text-text-main transition-colors">
              <FileText className="w-[12px] h-[12px]" />
              Términos y Condiciones
            </button>
            <button className="w-full flex items-center gap-2 text-[11px] text-text-muted hover:text-text-main transition-colors">
              <FileText className="w-[12px] h-[12px]" />
              Política de Privacidad
            </button>
            <button className="w-full flex items-center gap-2 text-[11px] text-text-muted hover:text-text-main transition-colors">
              <FileText className="w-[12px] h-[12px]" />
              Política de Devoluciones
            </button>
          </div>
        </div>

        <div className="relative h-[80px] rounded-[4px] overflow-hidden bg-gradient-to-r from-[rgba(229,9,20,0.15)] to-[rgba(229,9,20,0.05)] border border-[#27272A] flex items-center justify-center">
          <div className="text-center">
            <Crown className="w-[20px] h-[20px] text-[#E50914] mx-auto mb-1" />
            <p className="text-[10px] font-bold text-text-dim">API-CINE v1.0</p>
          </div>
        </div>
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
