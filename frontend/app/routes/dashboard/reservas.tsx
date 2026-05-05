import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  cancelarReserva,
  getAsientosDisponibles,
  getFuncionesPorPelicula,
  getMisReservas,
  getPeliculas,
  type AsientoDisponible,
  type Funcion,
  type Pelicula,
  type Reserva,
} from "../../services/cineService";
import { useCartStore, useCartTotals } from "../../stores/useCartStore";
import { getSnacks, type Snack } from "../../services/snackService";
import { LoadingSpinner } from "../../components/Notifications";
import { useAppToast } from "../../components/ToastProvider";
import { Armchair, Minus, Plus, ShoppingBag, Utensils } from "lucide-react";

function formatFecha(fechaISO: string) {
  const d = new Date(fechaISO);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Reservas() {
  const { addToast } = useAppToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [asientos, setAsientos] = useState<AsientoDisponible[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [showSnacks, setShowSnacks] = useState(false);

  const [peliculaId, setPeliculaId] = useState<string>(searchParams.get("peliculaId") || "");
  const [funcionId, setFuncionId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const cartAsientos = useCartStore((s) => s.asientos);
  const cartSnacks = useCartStore((s) => s.snacks);
  const { total, itemCount } = useCartTotals();
  const setFuncion = useCartStore((s) => s.setFuncion);
  const toggleAsiento = useCartStore((s) => s.toggleAsiento);
  const addAsiento = useCartStore((s) => s.addAsiento);
  const removeAsiento = useCartStore((s) => s.removeAsiento);
  const addSnack = useCartStore((s) => s.addSnack);
  const updateSnackCantidad = useCartStore((s) => s.updateSnackCantidad);
  const hasAsiento = useCartStore((s) => s.hasAsiento);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const [pelis, mis, snacksData] = await Promise.all([
          getPeliculas(),
          getMisReservas(),
          getSnacks(),
        ]);
        if (!alive) return;
        setPeliculas(pelis);
        setReservas(mis);
        setSnacks(snacksData);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Error cargando datos";
        setError(msg);
        try { addToast({ type: "error", title: msg }); } catch {}
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const current = searchParams.get("peliculaId") || "";
    if (peliculaId !== current) {
      const next = new URLSearchParams(searchParams);
      if (peliculaId) next.set("peliculaId", peliculaId);
      else next.delete("peliculaId");
      setSearchParams(next, { replace: true });
    }
  }, [peliculaId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setFunciones([]);
      setFuncionId("");
      setAsientos([]);
      setSuccess("");
      if (!peliculaId) return;

      try {
        const data = await getFuncionesPorPelicula(peliculaId);
        if (!alive) return;
        setFunciones(data);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Error cargando funciones";
        setError(msg);
        try { addToast({ type: "error", title: msg }); } catch {}
      }
    })();
    return () => { alive = false; };
  }, [peliculaId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setAsientos([]);
      setSuccess("");
      if (!funcionId) return;

      try {
        const data = await getAsientosDisponibles(funcionId);
        if (!alive) return;
        setAsientos(data);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Error cargando asientos";
        setError(msg);
        try { addToast({ type: "error", title: msg }); } catch {}
      }
    })();
    return () => { alive = false; };
  }, [funcionId]);

  const selectedFuncion = funciones.find((f) => f._id === funcionId);
  const selectedPelicula = peliculas.find((p) => p._id === peliculaId);

  const handleToggleAsiento = (a: AsientoDisponible) => {
    if (!selectedFuncion) return;
    toggleAsiento({ ...a, precio: selectedFuncion.precio_base });
  };

  const handleIrACheckout = () => {
    if (!funcionId || !selectedFuncion || !selectedPelicula) {
      const msg = "Selecciona una función y al menos un asiento";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }
    if (cartAsientos.length === 0) {
      const msg = "Selecciona al menos 1 asiento";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }

    const salaNombre = typeof selectedFuncion.sala_id === "string"
      ? "Sala"
      : selectedFuncion.sala_id.nombre;

    setFuncion(funcionId, {
      peliculaTitulo: selectedPelicula.titulo,
      salaNombre,
      fechaHora: selectedFuncion.fecha_hora,
      precioBase: selectedFuncion.precio_base,
      formato: selectedFuncion.formato,
    });

    navigate("/dashboard/reservas/checkout");
  };

  const handleCancelar = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      await cancelarReserva(id);
      const mis = await getMisReservas();
      setReservas(mis);
      const msg = "Reserva cancelada";
      setSuccess(msg);
      try { addToast({ type: "success", title: msg }); } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error cancelando reserva";
      setError(msg);
      try { addToast({ type: "error", title: msg }); } catch {}
    }
  };

  return (
    <div className="p-6 bg-bg-main min-h-full transition-colors duration-300 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main transition-colors">Reservas</h1>
        <p className="text-text-dim transition-colors">Selecciona película, función y asientos para tu reserva</p>
      </div>

      {(error || success) && (
        <div
          className={`p-4 rounded-lg border transition-all ${
            error
              ? "bg-red-500/10 border-red-500"
              : "bg-green-500/10 border-green-500"
          }`}
        >
          <p className={`text-sm ${error ? "text-red-400" : "text-green-400"}`}>
            {error || success}
          </p>
        </div>
      )}

      <section className="bg-bg-card border border-border-base rounded-lg p-6 space-y-5 transition-colors">
        <h2 className="text-xl font-bold text-text-main transition-colors">Nueva Reserva</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Cargando..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2 transition-colors">
                  Película
                </label>
                <select
                  value={peliculaId}
                  onChange={(e) => setPeliculaId(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main focus:outline-none focus:border-primary-red transition-colors"
                >
                  <option value="">Selecciona una película</option>
                  {peliculas.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2 transition-colors">
                  Función
                </label>
                <select
                  value={funcionId}
                  onChange={(e) => setFuncionId(e.target.value)}
                  disabled={!peliculaId || funciones.length === 0}
                  className="w-full px-4 py-3 bg-bg-side border border-border-base rounded-sm text-text-main focus:outline-none focus:border-primary-red disabled:opacity-50 transition-colors"
                >
                  <option value="">
                    {peliculaId
                      ? funciones.length > 0
                        ? "Selecciona una función"
                        : "No hay funciones disponibles"
                      : "Selecciona una película primero"}
                  </option>
                  {funciones.map((f) => (
                    <option key={f._id} value={f._id}>
                      {formatFecha(f.fecha_hora)} · {typeof f.sala_id === "string" ? "Sala" : f.sala_id.nombre} · {f.formato} · ${f.precio_base}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-main transition-colors">Asientos</h3>
                <span className="text-xs text-text-dim transition-colors">
                  Seleccionados: {cartAsientos.length}
                </span>
              </div>

              {!funcionId ? (
                <p className="text-text-dim transition-colors">Selecciona una función para ver asientos.</p>
              ) : asientos.length === 0 ? (
                <p className="text-text-dim transition-colors">No hay asientos para esta función.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const byRow = new Map<string, AsientoDisponible[]>();
                    for (const a of asientos) {
                      const f = (a.fila || "").toUpperCase();
                      if (!byRow.has(f)) byRow.set(f, []);
                      byRow.get(f)!.push(a);
                    }
                    for (const [, arr] of byRow) arr.sort((x, y) => x.numero - y.numero);
                    const rows = Array.from(byRow.entries()).sort((a, b) => a[0].localeCompare(b[0]));

                    return rows.map(([fila, filaAsientos]) => (
                      <div key={fila} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-bold text-text-dim transition-colors">{fila}</span>
                        <div className="flex flex-wrap gap-2">
                          {filaAsientos.map((a) => {
                            const selected = cartAsientos.some((ca) => ca._id === a._id);
                            const disabled = !a.disponible;
                            return (
                              <button
                                key={a._id}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleToggleAsiento(a)}
                                className={`w-10 h-10 rounded border text-xs font-semibold transition-all ${
                                  disabled
                                    ? "bg-bg-side border-border-base text-text-dim/50 cursor-not-allowed opacity-60"
                                    : selected
                                    ? "bg-primary-red border-primary-red text-white"
                                    : "bg-bg-side border-border-base text-text-main hover:border-primary-red"
                                }`}
                                title={`${fila}${a.numero} · ${a.tipo} ${disabled ? "(ocupado)" : ""}`}
                              >
                                {a.numero}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="border-t border-border-base pt-4">
              <button
                onClick={() => setShowSnacks(!showSnacks)}
                className="flex items-center gap-2 text-text-main hover:text-primary-red transition-colors"
              >
                <Utensils className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">
                  {showSnacks ? "Ocultar snacks" : "Agregar snacks a mi reserva"}
                </span>
              </button>

              {showSnacks && snacks.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {snacks.filter((s) => s.disponible).map((snack) => {
                    const cartItem = cartSnacks.find((s) => s.snack._id === snack._id);
                    return (
                      <div
                        key={snack._id}
                        className="bg-bg-side border border-border-base rounded-sm p-3 space-y-2"
                      >
                        <div>
                          <p className="text-sm font-bold text-text-main">{snack.nombre}</p>
                          <p className="text-xs text-text-dim">${snack.precio.toFixed(2)}</p>
                        </div>
                        {cartItem ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => updateSnackCantidad(snack._id, cartItem.cantidad - 1)}
                              className="w-8 h-8 rounded border border-border-base bg-bg-main flex items-center justify-center text-text-main hover:border-primary-red transition-colors"
                            >
                              <Minus className="w-[14px] h-[14px]" />
                            </button>
                            <span className="text-sm font-bold text-text-main">{cartItem.cantidad}</span>
                            <button
                              onClick={() => addSnack(snack)}
                              className="w-8 h-8 rounded border border-border-base bg-bg-main flex items-center justify-center text-text-main hover:border-primary-red transition-colors"
                            >
                              <Plus className="w-[14px] h-[14px]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addSnack(snack)}
                            className="w-full py-2 text-xs font-bold text-primary-red border border-primary-red/30 rounded-sm hover:bg-primary-red/10 transition-colors"
                          >
                            Agregar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {itemCount > 0 && (
              <div className="border-t border-border-base pt-4 space-y-3">
                <div className="flex items-center gap-2 text-text-main">
                  <ShoppingBag className="w-[18px] h-[18px]" />
                  <span className="text-sm font-bold">Tu Reserva ({itemCount} items)</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cartAsientos.map((a) => (
                    <span
                      key={a._id}
                      className="flex items-center gap-1 px-2 py-1 bg-bg-side border border-border-base rounded-sm text-xs"
                    >
                      <Armchair className="w-[12px] h-[12px] text-primary-red" />
                      {a.fila}{a.numero}
                      <span className="text-text-dim">· ${a.precio.toFixed(2)}</span>
                    </span>
                  ))}
                  {cartSnacks.map((s) => (
                    <span
                      key={s.snack._id}
                      className="flex items-center gap-1 px-2 py-1 bg-bg-side border border-border-base rounded-sm text-xs"
                    >
                      <Utensils className="w-[12px] h-[12px] text-primary-red" />
                      {s.snack.nombre} x{s.cantidad}
                      <span className="text-text-dim">· ${(s.snack.precio * s.cantidad).toFixed(2)}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-dim">
                    Total:{" "}
                    <span className="text-lg font-bold text-text-main">
                      ${total.toFixed(2)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleIrACheckout}
                    disabled={cartAsientos.length === 0}
                    className="px-5 py-3 bg-primary-red hover:bg-[#c0000c] disabled:bg-[#999999] text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    Ir a Confirmar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-text-main transition-colors">Mis Reservas</h2>

        {isLoading ? (
          <p className="text-text-dim transition-colors">Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p className="text-text-dim transition-colors">Aún no tienes reservas.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reservas.map((r) => {
              const pelicula = r.funcion_id?.pelicula_id;
              const titulo = pelicula?.titulo ?? "Reserva";
              const poster = pelicula?.poster_url;
              const fecha = r.funcion_id?.fecha_hora ? formatFecha(r.funcion_id.fecha_hora) : "";
              const sala = r.funcion_id?.sala_id?.nombre ?? "";
              const seats = (r.asientos_ids ?? [])
                .map((a) => `${a.fila}${a.numero}`)
                .join(", ");

              return (
                <div
                  key={r._id}
                  className="bg-bg-card border border-border-base rounded-lg overflow-hidden transition-colors"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-28 bg-bg-side rounded overflow-hidden flex-shrink-0 transition-colors">
                      {poster ? (
                        <img src={poster} alt={titulo} className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-text-main truncate transition-colors">{titulo}</h3>
                          <p className="text-sm text-text-dim transition-colors">{fecha}</p>
                          {sala && <p className="text-xs text-text-dim/70 transition-colors">{sala}</p>}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            r.estado === "confirmada"
                              ? "bg-green-500/20 text-green-400"
                              : r.estado === "cancelada"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {r.estado}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-text-dim transition-colors truncate">Asientos: {seats || "-"}</p>
                        <p className="text-sm font-bold text-text-main transition-colors">${r.total}</p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancelar(r._id)}
                          disabled={r.estado === "cancelada"}
                          className="px-4 py-2 bg-bg-side border border-border-base text-text-dim hover:border-primary-red hover:text-text-main rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
