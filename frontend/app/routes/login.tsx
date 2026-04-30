import { Form, useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import type { Route } from "./+types/login";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Iniciar Sesión - CINEMA PREMIUM" }];
}

export default function Login() {
  const { login, isLoading } = useAuth();
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
      setError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1f1f1f] rounded-lg p-8 border border-[#333] shadow-[0_0_20px_rgba(229,9,20,0.1)]">
        <h1 className="text-4xl font-bold text-white mb-2">Iniciar Sesión</h1>
        <p className="text-[#e9bcb6] mb-8">Disfruta de la mejor experiencia cinematográfica.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Form method="post" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30 disabled:opacity-50"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            <a href="#" className="block text-right text-sm text-[#e9bcb6] hover:text-[#E50914] mt-2 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="w-4 h-4 accent-[#E50914]"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-[#e2e2e2]">
              Recordarme por 30 días
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E50914] hover:bg-[#ff1a25] disabled:bg-[#999999] text-white font-semibold py-3 px-4 rounded-sm transition-colors duration-200 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]"
          >
            {isLoading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </Form>

        <div className="mt-6 text-center text-[#af8782]">
          ¿No tienes cuenta?{" "}
          <a 
            href="/register" 
            className="text-[#E50914] hover:text-[#ffb4aa] font-medium transition-colors"
          >
            Regístrate
          </a>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#333]"></div>
          <span className="px-4 text-sm text-[#e9bcb6]">O continúa con</span>
          <div className="flex-1 h-px bg-[#333]"></div>
        </div>

        <button
          disabled
          className="w-full py-3 bg-[#141414] border border-[#333] rounded-sm text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="text-lg font-bold">G</span>
          Google
        </button>
      </div>
    </div>
  );
}
