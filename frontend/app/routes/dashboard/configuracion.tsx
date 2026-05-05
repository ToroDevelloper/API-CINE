import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/useThemeStore";

export default function Configuracion() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="p-10 md:p-16 bg-bg-main min-h-full animate-in fade-in duration-700 transition-colors">
      <h1 className="text-xs font-bold text-text-dim mb-8 uppercase tracking-[0.4em] leading-none transition-colors">
        Personalización
      </h1>
      
      <div className="inline-flex items-center p-1.5 bg-bg-side border border-border-base rounded-full shadow-2xl transition-colors">
        {/* Botón Modo Oscuro */}
        <button 
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.15em] transition-all active:scale-95 ${
            theme === "dark" 
              ? "bg-gradient-to-r from-primary-red to-[#BE123C] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]" 
              : "text-text-dim hover:text-text-main hover:bg-white/5"
          }`}
        >
          <Moon className={`w-3.5 h-3.5 ${theme === "dark" ? "fill-current" : ""}`} />
          OSCURO
        </button>

        {/* Botón Modo Claro */}
        <button 
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.15em] transition-all active:scale-95 ${
            theme === "light" 
              ? "bg-gradient-to-r from-primary-red to-[#BE123C] text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]" 
              : "text-text-dim hover:text-text-main hover:bg-black/5"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          CLARO
        </button>
      </div>
      
      <div className="mt-4 px-4">
        <p className="text-[10px] text-text-dim font-medium tracking-wide transition-colors">
          Selecciona el tema visual de la plataforma
        </p>
      </div>
    </div>
  );
}




