import { Form, useActionData, useNavigation } from "react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { User, Mail, Lock } from "lucide-react";
import { register as apiRegister } from "../services/authService";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;

  try {
    await apiRegister({ email, password, nombre, apellido });
    return { success: true, message: "Registro exitoso. Redirigiendo..." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error de conexión con el servidor" };
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

        <h1 className="text-[32px] font-bold text-text-main mb-2">Regístrate</h1>
        <p className="text-[16px] text-text-dim mb-8">Crea tu cuenta y reserva tus entradas</p>

        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
            <p className="text-red-400 text-[14px]">{actionData.error}</p>
          </div>
        )}

        {actionData?.success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-[2px]">
            <p className="text-green-400 text-[14px]">{actionData.message}</p>
          </div>
        )}

        <Form method="post" className="space-y-[16px]">
          <div>
            <label htmlFor="nombre" className="block text-[14px] font-medium text-text-heading mb-[8px]">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-dim" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782]"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div>
            <label htmlFor="apellido" className="block text-[14px] font-medium text-text-heading mb-[8px]">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-dim" />
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782]"
                placeholder="Tu apellido"
              />
            </div>
          </div>

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
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782]"
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
                minLength={6}
                className="w-full pl-[40px] pr-[16px] py-[12px] bg-bg-input border border-bg-input-border rounded-[2px] text-text-main text-[16px] placeholder-text-dim focus:outline-none focus:border-[#AF8782]"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E50914] hover:bg-[#c0000c] disabled:bg-text-dim text-white font-bold py-[12px] px-[24px] rounded-[2px] transition-colors disabled:cursor-not-allowed text-[14px] uppercase tracking-[0.05em]"
          >
            {isSubmitting ? "Registrando..." : "Crear Cuenta"}
          </button>
        </Form>

        <p className="mt-[24px] text-center text-[14px] text-text-muted">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-[#E50914] hover:text-[#ffb4aa] font-medium transition-colors">
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
}
