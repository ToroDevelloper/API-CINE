import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  cancelarReserva,
  crearReserva,
  getAsientosDisponibles,
  getFuncionesPorPelicula,
  getMisReservas,
  getPeliculas,
  type AsientoDisponible,
  type Funcion,
  type Pelicula,
  type Reserva,
} from "../../services/cineService";
import { LoadingSpinner } from "../../components/Notifications";
import { useAppToast } from "../../components/ToastProvider";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [asientos, setAsientos] = useState<AsientoDisponible[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [peliculaId, setPeliculaId] = useState<string>(searchParams.get("peliculaId") || "");
  const [funcionId, setFuncionId] = useState<string>("");
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const [pelis, mis] = await Promise.all([getPeliculas(), getMisReservas()]);
        if (!alive) return;
        setPeliculas(pelis);
        setReservas(mis);
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
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // mantener query param sincronizado (para deep-link desde Películas/Home)
    const current = searchParams.get("peliculaId") || "";
    if (peliculaId !== current) {
      const next = new URLSearchParams(searchParams);
      if (peliculaId) next.set("peliculaId", peliculaId);
      else next.delete("peliculaId");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peliculaId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setFunciones([]);
      setFuncionId("");
      setAsientos([]);
      setAsientosSeleccionados(new Set());
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
    return () => {
      alive = false;
    };
  }, [peliculaId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setAsientos([]);
      setAsientosSeleccionados(new Set());
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
    return () => {
      alive = false;
    };
  }, [funcionId]);

  const asientosPorFila = useMemo(() => {
    const map = new Map<string, AsientoDisponible[]>();
    for (const a of asientos) {
      const fila = (a.fila || "").toUpperCase();
      if (!map.has(fila)) map.set(fila, []);
      map.get(fila)!.push(a);
    }
    for (const [, arr] of map) {
      arr.sort((x, y) => x.numero - y.numero);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [asientos]);

  const toggleAsiento = (asientoId: string) => {
    setAsientosSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(asientoId)) next.delete(asientoId);
      else next.add(asientoId);
      return next;
    });
  };

  const handleCrearReserva = async () => {
    setError("");
    setSuccess("");

    if (!funcionId) {
      const msg = "Selecciona una función";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }
    if (asientosSeleccionados.size === 0) {
      const msg = "Selecciona al menos 1 asiento";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }

    setIsCreating(true);
    try {
      await crearReserva({
        funcion_id: funcionId,
        asientos_ids: Array.from(asientosSeleccionados),
      });

      const mis = await getMisReservas();
      setReservas(mis);
      const msg = "Reserva creada correctamente";
      setSuccess(msg);
      try { addToast({ type: "success", title: msg }); } catch {}
      setFuncionId("");
      setAsientos([]);
      setAsientosSeleccionados(new Set());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error creando reserva";
      setError(msg);
      try { addToast({ type: "error", title: msg }); } catch {}
    } finally {
      setIsCreating(false);
    }
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
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reservas</h1>
        <p className="text-[#999]">Crea una reserva y gestiona tus entradas</p>
      </div>

      {(error || success) && (
        <div
          className={`p-4 rounded-lg border ${
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

      {/* Nueva reserva */}
      <section className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6 space-y-5">
        <h2 className="text-xl font-bold">Nueva Reserva</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Cargando..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#e2e2e2] mb-2">
                  Película
                </label>
                <select
                  value={peliculaId}
                  onChange={(e) => setPeliculaId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#E50914]"
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
                <label className="block text-sm font-medium text-[#e2e2e2] mb-2">
                  Función
                </label>
                <select
                  value={funcionId}
                  onChange={(e) => setFuncionId(e.target.value)}
                  disabled={!peliculaId || funciones.length === 0}
                  className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-sm text-white focus:outline-none focus:border-[#E50914] disabled:opacity-50"
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

            {/* Asientos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Asientos</h3>
                <span className="text-xs text-[#999]">
                  Seleccionados: {asientosSeleccionados.size}
                </span>
              </div>

              {!funcionId ? (
                <p className="text-[#999]">Selecciona una función para ver asientos.</p>
              ) : asientos.length === 0 ? (
                <p className="text-[#999]">No hay asientos para esta función.</p>
              ) : (
                <div className="space-y-3">
                  {asientosPorFila.map(([fila, filaAsientos]) => (
                    <div key={fila} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-bold text-[#e9bcb6]">{fila}</span>
                      <div className="flex flex-wrap gap-2">
                        {filaAsientos.map((a) => {
                          const selected = asientosSeleccionados.has(a._id);
                          const disabled = !a.disponible;
                          return (
                            <button
                              key={a._id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleAsiento(a._id)}
                              className={`w-10 h-10 rounded border text-xs font-semibold transition-all ${
                                disabled
                                  ? "bg-[#141414] border-[#333] text-[#666] cursor-not-allowed opacity-60"
                                  : selected
                                  ? "bg-[#E50914] border-[#E50914] text-white"
                                  : "bg-[#1a1a1a] border-[#333] text-[#e2e2e2] hover:border-[#E50914]"
                              }`}
                              title={`${fila}${a.numero} · ${a.tipo} ${disabled ? "(ocupado)" : ""}`}
                            >
                              {a.numero}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCrearReserva}
                disabled={isCreating || !funcionId || asientosSeleccionados.size === 0}
                className="px-5 py-3 bg-[#E50914] hover:bg-[#c0000c] disabled:bg-[#999999] text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isCreating ? "Reservando..." : "Confirmar Reserva"}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Mis reservas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Mis Reservas</h2>
        </div>

        {isLoading ? (
          <p className="text-[#999]">Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p className="text-[#999]">Aún no tienes reservas.</p>
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
                  className="bg-[#1f1f1f] border border-[#333] rounded-lg overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-28 bg-[#141414] rounded overflow-hidden flex-shrink-0">
                      {poster ? (
                        <img src={poster} alt={titulo} className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white truncate">{titulo}</h3>
                          <p className="text-sm text-[#e9bcb6]">{fecha}</p>
                          {sala && <p className="text-xs text-[#999]">{sala}</p>}
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
                        <p className="text-xs text-[#999] truncate">Asientos: {seats || "-"}</p>
                        <p className="text-sm font-bold text-white">${r.total}</p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancelar(r._id)}
                          disabled={r.estado === "cancelada"}
                          className="px-4 py-2 bg-[#141414] border border-[#333] text-[#e9bcb6] hover:border-[#E50914] hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
