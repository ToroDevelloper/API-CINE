import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

/**
 * Estructura de Enrutamiento Profesional para API Cine
 * 
 * RUTAS PÚBLICAS:
 *   - / (home)
 *   - /login
 *   - /register
 * 
 * RUTAS PROTEGIDAS:
 *   - /dashboard/* (requiere autenticación)
 */

export default [
  // Layout para rutas públicas
  layout("routes/layout.public.tsx", [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/register", "routes/register.tsx"),
  ]),
  
  // Layout para rutas protegidas del dashboard
  layout("routes/dashboard/layout.tsx", [
    route("/dashboard", "routes/dashboard/home.tsx"),
    route("/dashboard/peliculas", "routes/dashboard/peliculas.tsx"),
    route("/dashboard/reservas", "routes/dashboard/reservas.tsx"),
    route("/dashboard/configuracion", "routes/dashboard/configuracion.tsx"),
  ]),
] satisfies RouteConfig;
