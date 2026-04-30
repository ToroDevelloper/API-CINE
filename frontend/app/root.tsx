import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { AuthProvider } from "./context/auth";
import "./app.css";

/**
 * Links (estilos globales, fuentes, etc.)
 */
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
];

/**
 * Layout raíz - Estructura HTML
 * Envuelve toda la aplicación con AuthProvider para disponibilidad global
 * del contexto de autenticación
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="API Cine - Reserva de películas en línea" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#131313] text-white font-inter">
        <AuthProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </AuthProvider>
      </body>
    </html>
  );
}

/**
 * App raíz - Renderiza las rutas
 * Los Layouts anidados se encargan de la estructura específica
 * (PublicLayout para rutas públicas, DashboardLayout para protegidas)
 */
export default function App() {
  return <Outlet />;
}

/**
 * Error Boundary - Captura errores en las rutas
 * Muestra página de error amigable cuando algo falla
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "¡Ups! Algo salió mal";
  let details = "Ocurrió un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "La página solicitada no se pudo encontrar."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">{message}</h1>
        <p className="text-xl text-[#e9bcb6] mb-8">{details}</p>
        <a 
          href="/" 
          className="inline-block bg-[#E50914] hover:bg-[#c0000c] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Volver al inicio
        </a>
        {stack && import.meta.env.DEV && (
          <pre className="mt-8 w-full p-4 overflow-x-auto bg-[#1f1f1f] rounded border border-[#353535]">
            <code className="text-sm text-[#ff9999]">{stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
