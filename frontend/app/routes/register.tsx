import { Form, useActionData, useNavigation } from "react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { User, Mail, Lock } from "lucide-react";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;

  try {
    const response = await fetch("http://localhost:3000/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre, apellido }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || "Error al registrarse" };
    }

    return { success: true, message: "Registro exitoso. Redirigiendo..." };
  } catch {
    return { error: "Error de conexión con el servidor" };
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [actionData, navigate]);

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1f1f1f] rounded-lg p-8 border border-[#333] shadow-[0_0_20px_rgba(229,9,20,0.1)]">
        <h1 className="text-4xl font-bold text-white mb-2">Regístrate</h1>
        <p className="text-[#e9bcb6] mb-8">Crea tu cuenta y vive la experiencia CINEMA.</p>

        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{actionData.error}</p>
          </div>
        )}

        {actionData?.success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{actionData.message}</p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-[#e2e2e2] mb-2">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30"
                placeholder="Tu apellido"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30"
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
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white placeholder-[#666] focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/30"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E50914] hover:bg-[#ff1a25] disabled:bg-[#999999] text-white font-semibold py-3 px-4 rounded-sm transition-colors duration-200 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]"
          >
            {isSubmitting ? "Registrando..." : "Crear Cuenta"}
          </button>
        </Form>

        <p className="mt-6 text-center text-[#af8782]">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-[#E50914] hover:text-[#ffb4aa] font-medium transition-colors">
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
}
