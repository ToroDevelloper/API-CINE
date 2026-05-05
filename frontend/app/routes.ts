import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/layout.public.tsx", [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/register", "routes/register.tsx"),
  ]),

  layout("routes/dashboard/layout.tsx", [
    route("/dashboard", "routes/dashboard/home.tsx"),
    route("/dashboard/peliculas", "routes/dashboard/peliculas.tsx"),
    route("/dashboard/reservas", "routes/dashboard/reservas.tsx"),
    route("/dashboard/reservas/checkout", "routes/dashboard/order-details.tsx"),
    route("/dashboard/usuarios", "routes/dashboard/usuarios.tsx"),
    route("/dashboard/salas", "routes/dashboard/salas.tsx"),
    route("/dashboard/asientos", "routes/dashboard/asientos.tsx"),
    route("/dashboard/funciones", "routes/dashboard/funciones.tsx"),
    route("/dashboard/snacks", "routes/dashboard/snacks.tsx"),
    route("/dashboard/pedidos", "routes/dashboard/pedidos.tsx"),
    route("/dashboard/pagos", "routes/dashboard/pagos.tsx"),
    route("/dashboard/configuracion", "routes/dashboard/configuracion.tsx"),
  ]),
] satisfies RouteConfig;
