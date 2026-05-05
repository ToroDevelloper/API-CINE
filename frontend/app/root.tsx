import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { useEffect } from "react";
import { ToastProvider } from "./components/ToastProvider";

import type { Route } from "./+types/root";
import { useAuthStore } from "./stores/useAuthStore";
import { useThemeStore } from "./stores/useThemeStore";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  return (
    <html lang="es" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="API Cine - Reserva de películas en línea" />
        <Meta />
        <Links />
      </head>
      <body className="font-['Be_Vietnam_Pro']">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    void useAuthStore.getState().init();
  }, []);

  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const theme = useThemeStore((s) => s.theme);
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

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-[#0D0D0D] text-white" : "bg-[#F4F4F5] text-[#18181B]"}`}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">{message}</h1>
        <p className={`text-xl mb-8 ${isDark ? "text-[#e9bcb6]" : "text-[#52525B]"}`}>{details}</p>
        <a
          href="/"
          className="inline-block bg-[#E50914] hover:bg-[#c0000c] text-white font-semibold py-3 px-6 rounded-[2px] transition-colors"
        >
          Volver al inicio
        </a>
        {stack && import.meta.env.DEV && (
          <pre className={`mt-8 w-full p-4 overflow-x-auto rounded border ${isDark ? "bg-[#1A1A1A] border-[#18181B] text-[#ff9999]" : "bg-[#FFFFFF] border-[#D4D4D8] text-red-600"}`}>
            <code className="text-sm">{stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
