import { Form, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useAppToast } from "../components/ToastProvider";
import type { Route } from "./+types/login";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Iniciar Sesión - API CINE" }];
}

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const { addToast } = useAppToast();
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const success = await login(email, password);
      if (success) {
        addToast({ type: "success", title: "Bienvenido" });
        navigate("/dashboard", { replace: true });
      } else {
        const msg = "Email o contraseña incorrectos";
        setError(msg);
        addToast({ type: "error", title: msg });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo.";
      setError(msg);
      addToast({ type: "error", title: msg });
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card rounded-[4px] p-8 border border-border-base">
        <div className="flex items-center gap-[8px] mb-6">
          <div className="w-[32px] h-[32px] bg-[#E50914] rounded-[2px] flex items-center justify-center font-black text-white text-[18px]">
            C
          </div>
          <span className="text-[20px] font-bold tracking-[-0.025em] text-text-main">
            INEMA
          </span>
        </div>

        <h1 className="text-[32px] font-bold text-text-main mb-2">Iniciar Sesión</h1>
        <p className="text-[16px] text-text-dim mb-8">Accede a tu cuenta para reservar entradas</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
            <p className="text-red-400 text-[14px]">{error}</p>
          </div>
        )}

        <Form method="post" onSubmit={handleSubmit} className="space-y-[20px]">
          <div>
            <label htmlFor="email" className="block text-[14px] font-medium text-text-heading mb-[8px]">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-dim" />
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782] disabled:opacity-50"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[14px] font-medium text-text-heading mb-[8px]">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-dim" />
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782] disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            <a href="#" className="block text-right text-[14px] text-text-dim hover:text-[#E50914] mt-[8px] transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E50914] hover:bg-[#c0000c] disabled:bg-text-dim text-white font-bold py-[12px] px-[24px] rounded-[2px] transition-colors disabled:cursor-not-allowed text-[14px] uppercase tracking-[0.05em]"
          >
            {isLoading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </Form>

        <div className="mt-[24px] text-center text-[14px] text-text-muted">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-[#E50914] hover:text-[#ffb4aa] font-medium transition-colors"
          >
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}
