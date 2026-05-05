import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useCartStore, useCartTotals } from "../stores/useCartStore";
import { useState } from "react";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon,
  ShoppingCart,
  Minus,
  Plus,
  X,
  Trash2,
} from "lucide-react";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const cartAsientos = useCartStore((s) => s.asientos);
  const cartSnacks = useCartStore((s) => s.snacks);
  const removeAsiento = useCartStore((s) => s.removeAsiento);
  const updateSnackCantidad = useCartStore((s) => s.updateSnackCantidad);
  const removeSnack = useCartStore((s) => s.removeSnack);
  const clearCart = useCartStore((s) => s.clearCart);
  const { total, itemCount } = useCartTotals();

  const handleLogout = () => {
    void logout();
    setShowUserMenu(false);
    navigate("/", { replace: true });
  };

  const handleCheckout = () => {
    setShowCart(false);
    navigate("/dashboard/reservas/checkout");
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
              <Link to="/dashboard" className="text-text-dim hover:text-text-main transition-colors text-sm font-medium">
                Inicio
              </Link>
              <Link to="/dashboard/peliculas" className="text-text-dim hover:text-text-main transition-colors text-sm font-medium">
                Películas
              </Link>
              <Link to="/dashboard/reservas" className="text-text-dim hover:text-text-main transition-colors text-sm font-medium">
                Reservas
              </Link>
            </>
          ) : (
            <Link to="/" className="text-text-dim hover:text-text-main transition-colors text-sm font-medium">
              Inicio
            </Link>
          )}
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-lg bg-bg-card border border-border-base hover:border-primary-red flex items-center justify-center transition-all text-text-dim hover:text-text-main"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative w-10 h-10 rounded-lg bg-bg-card border border-border-base hover:border-primary-red flex items-center justify-center transition-all text-text-dim hover:text-text-main"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-red rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-bg-card">
                    {itemCount}
                  </span>
                )}
              </button>

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
                    <span className="text-[10px] text-text-dim font-bold uppercase tracking-tight transition-colors">
                      {user?.rol === "admin" ? "Admin" : "Usuario"}
                    </span>
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
              <Link to="/login" className="text-text-dim hover:text-text-main transition-colors text-sm font-medium">
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

      {/* Cart Dropdown Panel */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute top-16 right-6 lg:right-16 w-[380px] max-h-[70vh] bg-bg-card border border-border-base rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border-base flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-text-heading flex items-center gap-2">
                <ShoppingCart className="w-[18px] h-[18px] text-primary-red" />
                Tu Carrito ({itemCount})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-text-dim hover:text-text-main hover:bg-bg-main transition-colors"
              >
                <X className="w-[16px] h-[16px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cartAsientos.length === 0 && cartSnacks.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-text-dim mx-auto mb-3" />
                  <p className="text-[14px] text-text-dim">Tu carrito está vacío</p>
                  <p className="text-[12px] text-text-dim/70 mt-1">Selecciona asientos o snacks</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Asientos */}
                  {cartAsientos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-text-dim uppercase tracking-wider">Asientos</span>
                        <span className="text-[12px] text-text-dim">{cartAsientos.length} seleccionado(s)</span>
                      </div>
                      {cartAsientos.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center justify-between p-2 bg-bg-main rounded-sm border border-border-base"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-text-heading">
                              {a.fila}{a.numero}
                            </span>
                            <span className="text-[11px] text-text-dim capitalize">({a.tipo})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-text-heading">${a.precio.toFixed(2)}</span>
                            <button
                              onClick={() => removeAsiento(a._id)}
                              className="w-6 h-6 rounded flex items-center justify-center text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Trash2 className="w-[12px] h-[12px]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Snacks */}
                  {cartSnacks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-text-dim uppercase tracking-wider">Snacks</span>
                      </div>
                      {cartSnacks.map((s) => (
                        <div
                          key={s.snack._id}
                          className="flex items-center gap-3 p-2 bg-bg-main rounded-sm border border-border-base"
                        >
                          {s.snack.imagen_url ? (
                            <img
                              src={s.snack.imagen_url}
                              alt={s.snack.nombre}
                              className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-bg-side rounded-sm flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-[16px] h-[16px] text-[#585858]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-medium text-text-heading truncate block">{s.snack.nombre}</span>
                            <span className="text-[11px] text-text-dim">${s.snack.precio.toFixed(2)} c/u</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => updateSnackCantidad(s.snack._id, s.cantidad - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center border border-border-base text-text-dim hover:text-text-main hover:border-primary-red transition-colors"
                            >
                              <Minus className="w-[10px] h-[10px]" />
                            </button>
                            <span className="w-6 text-center text-[13px] font-bold text-text-heading">{s.cantidad}</span>
                            <button
                              onClick={() => updateSnackCantidad(s.snack._id, s.cantidad + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center border border-border-base text-text-dim hover:text-text-main hover:border-primary-red transition-colors"
                            >
                              <Plus className="w-[10px] h-[10px]" />
                            </button>
                            <span className="text-[14px] font-bold text-text-heading w-[52px] text-right">
                              ${(s.snack.precio * s.cantidad).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeSnack(s.snack._id)}
                              className="w-6 h-6 rounded flex items-center justify-center text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <Trash2 className="w-[12px] h-[12px]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {(cartAsientos.length > 0 || cartSnacks.length > 0) && (
              <div className="p-4 border-t border-border-base space-y-3 bg-bg-main">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text-muted">Total</span>
                  <span className="text-[20px] font-extrabold text-[#E50914]">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white text-[14px] font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all"
                >
                  Confirmar Reserva
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

