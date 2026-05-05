import { Form, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import type { Route } from "./+types/login";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Iniciar Sesión - CINEMA PREMIUM" }];
}

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
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
        navigate("/dashboard", { replace: true });
      } else {
        setError("Email o contraseña incorrectos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-bg-card rounded-lg p-8 border border-border-base shadow-[0_0_20px_rgba(225,29,72,0.1)] transition-colors">
        <h1 className="text-4xl font-bold text-text-main mb-2 transition-colors">Iniciar Sesión</h1>
        <p className="text-text-dim mb-8 transition-colors">Disfruta de la mejor experiencia cinematográfica.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Form method="post" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 disabled:opacity-50 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main mb-2 transition-colors">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 disabled:opacity-50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <a href="#" className="block text-right text-sm text-text-dim hover:text-primary-red mt-2 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="w-4 h-4 accent-primary-red"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-text-main transition-colors">
              Recordarme por 30 días
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-red hover:bg-[#ff1a25] disabled:bg-[#999999] text-white font-semibold py-3 px-4 rounded-sm transition-all duration-200 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(225,29,72,0.5)]"
          >
            {isLoading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </Form>

        <div className="mt-6 text-center text-text-dim">
          ¿No tienes cuenta?{" "}
          <a 
            href="/register" 
            className="text-primary-red hover:text-primary-red/80 font-medium transition-colors"
          >
            Regístrate
          </a>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border-base"></div>
          <span className="px-4 text-sm text-text-dim">O continúa con</span>
          <div className="flex-1 h-px bg-border-base"></div>
        </div>

        <button
          disabled
          className="w-full py-3 bg-bg-side border border-border-base rounded-sm text-text-main font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          <span className="text-lg font-bold">G</span>
          Google
        </button>
      </div>
    </div>
  );
}
