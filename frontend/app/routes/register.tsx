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
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-bg-card rounded-lg p-8 border border-border-base shadow-[0_0_20px_rgba(225,29,72,0.1)] transition-colors">
        <h1 className="text-4xl font-bold text-text-main mb-2 transition-colors">Regístrate</h1>
        <p className="text-text-dim mb-8 transition-colors">Crea tu cuenta y vive la experiencia CINEMA.</p>

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
            <label htmlFor="nombre" className="block text-sm font-medium text-text-main mb-2 transition-colors">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 transition-colors"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-text-main mb-2 transition-colors">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 transition-colors"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2 transition-colors">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 transition-colors"
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
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main placeholder-text-dim/50 focus:outline-none focus:border-primary-red focus:ring-2 focus:ring-primary-red/30 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-red hover:bg-[#ff1a25] disabled:bg-[#999999] text-white font-semibold py-3 px-4 rounded-sm transition-all duration-200 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(225,29,72,0.5)]"
          >
            {isSubmitting ? "Registrando..." : "Crear Cuenta"}
          </button>
        </Form>

        <p className="mt-6 text-center text-text-dim transition-colors">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-primary-red hover:text-primary-red/80 font-medium transition-colors">
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
}
