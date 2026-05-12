import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  getAsientosDisponibles,
  getFuncionesPorPelicula,
  getPeliculas,
  type AsientoDisponible,
  type Funcion,
  type Pelicula,
} from "../../services/cineService";
import { useCartStore } from "../../stores/useCartStore";
import { getSnacks, type Snack } from "../../services/snackService";
import { LoadingSpinner } from "../../components/Notifications";
import { useAppToast } from "../../components/ToastProvider";
import { Modal } from "../../components/ui/Modal";
import {
  Armchair,
  ChevronDown,
  Clock,
  Film,
  Minus,
  Plus,
  Utensils,
} from "lucide-react";

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

export default function Reservar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useAppToast();

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [asientos, setAsientos] = useState<AsientoDisponible[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [showSnacks, setShowSnacks] = useState(false);

  const [peliculaId, setPeliculaId] = useState<string>(searchParams.get("peliculaId") || "");
  const [funcionId, setFuncionId] = useState<string>("");
  const [selectedAsientos, setSelectedAsientos] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const cartSnacks = useCartStore((s) => s.snacks);
  const cartSetFuncion = useCartStore((s) => s.setFuncion);
  const cartAddAsiento = useCartStore((s) => s.addAsiento);
  const cartClearAsientos = useCartStore((s) => s.clearAsientos);
  const addSnack = useCartStore((s) => s.addSnack);
  const updateSnackCantidad = useCartStore((s) => s.updateSnackCantidad);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      setSelectedAsientos([]);
      try {
        const [pelis, snacksData] = await Promise.all([
          getPeliculas(),
          getSnacks(),
        ]);
        if (!alive) return;
        setPeliculas(pelis);
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
    let alive = true;
    (async () => {
      setFunciones([]);
      setFuncionId("");
      setAsientos([]);
      setSelectedAsientos([]);
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
      setSelectedAsientos([]);
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
    setSelectedAsientos((prev) =>
      prev.includes(a._id)
        ? prev.filter((id) => id !== a._id)
        : [...prev, a._id]
    );
  };

  const handleIrACheckout = () => {
    if (!funcionId || !selectedFuncion || !selectedPelicula) {
      const msg = "Selecciona una función";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }
    if (selectedAsientos.length === 0) {
      const msg = "Selecciona al menos 1 asiento";
      setError(msg);
      try { addToast({ type: "warning", title: msg }); } catch {}
      return;
    }

    const salaNombre = typeof selectedFuncion.sala_id === "string"
      ? "Sala"
      : selectedFuncion.sala_id.nombre;

    cartClearAsientos();
    selectedAsientos.forEach((id) => {
      const a = asientos.find((s) => s._id === id);
      if (a) cartAddAsiento({ ...a, precio: selectedFuncion.precio_base });
    });

    cartSetFuncion(funcionId, {
      peliculaTitulo: selectedPelicula.titulo,
      salaNombre,
      fechaHora: selectedFuncion.fecha_hora,
      precioBase: selectedFuncion.precio_base,
      formato: selectedFuncion.formato,
    });

    navigate("/dashboard/reservas/checkout");
  };

  const getSalaNombre = () => {
    if (!selectedFuncion) return "";
    return typeof selectedFuncion.sala_id === "string" ? "Sala" : selectedFuncion.sala_id.nombre;
  };

  const getSeatsByRow = () => {
    const byRow = new Map<string, AsientoDisponible[]>();
    for (const a of asientos) {
      const f = (a.fila || "").toUpperCase();
      if (!byRow.has(f)) byRow.set(f, []);
      byRow.get(f)!.push(a);
    }
    for (const [, arr] of byRow) arr.sort((x, y) => x.numero - y.numero);
    return Array.from(byRow.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const seatRows = getSeatsByRow();

  const getSeatType = (a: AsientoDisponible): "normal" | "vip" | "pareja" | "accesible" => {
    const t = (a.tipo || "").toLowerCase();
    if (t === "vip") return "vip";
    if (t === "pareja") return "pareja";
    if (t === "accesible" || t === "discapacitado") return "accesible";
    return "normal";
  };

  const getSeatStyle = (a: AsientoDisponible, selected: boolean) => {
    if (!a.disponible) return "bg-[#2A2A2A] border-[#333333] text-[#A1A1AA] opacity-60 cursor-not-allowed";
    if (selected) return "bg-[rgba(229,9,20,0.1)] border-[#E50914] text-[#E50914] relative";
    const type = getSeatType(a);
    if (type === "vip") return "bg-[#001B3C] border-[#0072D7] text-[#A7C8FF]";
    if (type === "pareja") return "bg-[rgba(255,180,170,0.1)] border-[rgba(255,180,170,0.5)] text-[#FFB4AA]";
    if (type === "accesible") return "bg-transparent border-dashed border-[#71717A] text-[#A1A1AA]";
    return "bg-[#2A2A2A] border-[#333333] text-[#A1A1AA]";
  };

  const getSeatSize = (a: AsientoDisponible, compact = false) => {
    const type = getSeatType(a);
    if (compact) {
      if (type === "vip") return "w-[36px] h-[36px] rounded-[6px_6px_4px_4px] text-[10px]";
      if (type === "pareja") return "w-[64px] h-[28px] rounded-[3px_3px_2px_2px] text-[10px]";
      return "w-[28px] h-[28px] rounded-[3px_3px_2px_2px] text-[10px]";
    }
    if (type === "vip") return "w-[48px] h-[48px] rounded-[8px_8px_6px_6px]";
    if (type === "pareja") return "w-[96px] h-[40px] rounded-[4px_4px_2px_2px]";
    return "w-[40px] h-[40px] rounded-[4px_4px_2px_2px]";
  };

  const getRowLabelColor = (fila: string) => {
    if (!funcionId || asientos.length === 0) return "text-[#52525B]";
    const rowSeats = asientos.filter(a => (a.fila || "").toUpperCase() === fila);
    if (rowSeats.length === 0) return "text-[#52525B]";
    const type = getSeatType(rowSeats[0]);
    if (type === "vip") return "text-[#A7C8FF]";
    if (type === "pareja") return "text-[#FFB4AA]";
    return "text-[#52525B]";
  };

  return (
    <div className="min-h-full">
      {(error || success) && (
        <div className="p-6 pb-0">
          <div className={`p-4 rounded-lg border transition-all ${error ? "bg-red-500/10 border-red-500" : "bg-green-500/10 border-green-500"}`}>
            <p className={`text-sm ${error ? "text-red-400" : "text-green-400"}`}>
              {error || success}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1024px] mx-auto px-[80px] py-[96px_80px_48px] space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
              Nueva Reserva
            </h1>
            <p className="text-[18px] text-[#A1A1AA] mt-1 leading-[1.6] max-w-[420px]">
              Selecciona película, función y asientos para tu reserva
            </p>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-4">
              {peliculaId && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                  <Film className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-white">{selectedPelicula?.titulo || "Película"}</span>
                </div>
              )}
              {selectedFuncion && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-white">{formatFecha(selectedFuncion.fecha_hora)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Cargando..." />
          </div>
        ) : (
          <>
            {/* Movie / Function Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[600px]">
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Película</label>
                <div className="relative">
                  <select
                    value={peliculaId}
                    onChange={(e) => setPeliculaId(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] transition-colors pr-10"
                  >
                    <option value="">Selecciona una película</option>
                    {peliculas.map((p) => (
                      <option key={p._id} value={p._id}>{p.titulo}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Función</label>
                <div className="relative">
                  <select
                    value={funcionId}
                    onChange={(e) => setFuncionId(e.target.value)}
                    disabled={!peliculaId || funciones.length === 0}
                    className="w-full appearance-none px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] disabled:opacity-50 transition-colors pr-10"
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Seat Grid + Sidebar */}
            {funcionId && (
              <div className="flex gap-6">
                <div className="flex-1 min-w-0">
                  {asientos.length === 0 ? (
                    <p className="text-[#A1A1AA] text-sm">No hay asientos disponibles para esta función.</p>
                  ) : (
                    <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-6 overflow-x-auto">
                      <div className="flex flex-col items-center pb-12">
                        <div className="w-[374px] h-[32px] bg-gradient-to-b from-[#3F3F46] to-transparent opacity-70 rounded-t-full shadow-[0_20px_50px_rgba(255,255,255,0.1)]" />
                        <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase mt-2">Pantalla</span>
                      </div>

                      <div className="space-y-4">
                        {seatRows.map(([fila, filaAsientos]) => {
                          const midpoint = Math.ceil(filaAsientos.length / 2);
                          const leftSeats = filaAsientos.slice(0, midpoint);
                          const rightSeats = filaAsientos.slice(midpoint);
                          const maxPerSide = Math.max(leftSeats.length, rightSeats.length);
                          const compact = maxPerSide > 5;
                          return (
                            <div key={fila} className="flex items-center justify-center gap-3">
                              <span className={`w-[14px] text-center text-xs font-bold ${getRowLabelColor(fila)}`}>
                                {fila}
                              </span>
                              <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
                                {leftSeats.map((a) => {
                                  const selected = selectedAsientos.includes(a._id);
                                  const disabled = !a.disponible;
                                  const type = getSeatType(a);
                                  return (
                                    <button
                                      key={a._id}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => handleToggleAsiento(a)}
                                      className={`flex items-center justify-center border font-bold transition-all ${getSeatSize(a, compact)} ${getSeatStyle(a, selected)}`}
                                      title={`${fila}${a.numero} · ${a.tipo}${!a.disponible ? " (ocupado)" : ""}`}
                                    >
                                      {type === "pareja" ? `${a.numero}-${a.numero + 1}` : a.numero}
                                      {selected && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E50914] rounded-full" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              {leftSeats.length > 0 && rightSeats.length > 0 && (
                                <span className="w-2" />
                              )}
                              <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
                                {rightSeats.map((a) => {
                                  const selected = selectedAsientos.includes(a._id);
                                  const disabled = !a.disponible;
                                  const type = getSeatType(a);
                                  return (
                                    <button
                                      key={a._id}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => handleToggleAsiento(a)}
                                      className={`flex items-center justify-center border font-bold transition-all ${getSeatSize(a, compact)} ${getSeatStyle(a, selected)}`}
                                      title={`${fila}${a.numero} · ${a.tipo}${!a.disponible ? " (ocupado)" : ""}`}
                                    >
                                      {type === "pareja" ? `${a.numero}-${a.numero + 1}` : a.numero}
                                      {selected && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E50914] rounded-full" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className={`w-[14px] text-center text-xs font-bold ${getRowLabelColor(fila)}`}>
                                {fila}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex items-center gap-6 px-6 py-3 bg-[rgba(10,10,10,0.8)] border border-[#333333] backdrop-blur-sm rounded-[12px] flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#2A2A2A] border border-[#333333] rounded-t-[2px]" />
                          <span className="text-xs text-[#A1A1AA]">Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#001B3C] border border-[#0072D7] rounded-t-[2px]" />
                          <span className="text-xs text-[#A1A1AA]">VIP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-4 bg-[rgba(255,180,170,0.1)] border border-[rgba(255,180,170,0.5)] rounded-t-[2px]" />
                          <span className="text-xs text-[#A1A1AA]">Pareja</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-dashed border-[#71717A] rounded-t-[2px]" />
                          <span className="text-xs text-[#A1A1AA]">Accesible</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[rgba(229,9,20,0.1)] border border-[#E50914] rounded-t-[2px]" />
                          <span className="text-xs text-[#A1A1AA]">Seleccionado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#2A2A2A] border border-[#333333] rounded-t-[2px] opacity-60" />
                          <span className="text-xs text-[#A1A1AA]">Ocupado</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-[216px] flex-shrink-0">
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-6 sticky top-24 space-y-6">
                    <div className="flex items-center justify-center gap-2 pb-4 border-b border-[#333333]">
                      <h3 className="text-xl text-white font-normal">Seleccionar</h3>
                      <span className="px-2 py-1 bg-[#E50914] rounded-[2px] text-xs font-bold tracking-[0.05em] uppercase text-white">
                        Asientos
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Sala</label>
                      <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] opacity-70">
                        <span className="text-base text-[#71717A]">{getSalaNombre() || "—"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Fila</label>
                        <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                          <span className="text-base font-bold text-white text-center block">
                            {selectedAsientos.length > 0
                              ? (() => {
                                  const a = asientos.find(s => s._id === selectedAsientos[0]);
                                  return a ? a.fila : "—";
                                })()
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Número</label>
                        <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                          <span className="text-base font-bold text-white text-center block">
                            {selectedAsientos.length > 0
                              ? (() => {
                                  const a = asientos.find(s => s._id === selectedAsientos[0]);
                                  return a ? a.numero : "—";
                                })()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#333333] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#71717A]">Seleccionados</span>
                        <span className="text-lg font-bold text-white">{selectedAsientos.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAsientos.map((id) => {
                          const a = asientos.find((s) => s._id === id);
                          if (!a) return null;
                          return (
                            <span key={a._id} className="flex items-center gap-1 px-2 py-1 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-xs">
                              <Armchair className="w-3 h-3 text-[#E50914]" />
                              {a.fila}{a.numero}
                            </span>
                          );
                        })}
                      </div>
                      {selectedAsientos.length > 0 && selectedFuncion && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#71717A]">Total</span>
                          <span className="text-base font-bold text-white">
                            ${(selectedFuncion.precio_base * selectedAsientos.length).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(-1)}
                          className="w-full px-3 py-2 border-2 border-[#666666] rounded-[2px] text-sm text-white hover:bg-[#0A0A0A] transition-colors text-center"
                        >
                          Volver
                        </button>
                        <button
                          type="button"
                          onClick={handleIrACheckout}
                          disabled={selectedAsientos.length === 0}
                          className="w-full px-3 py-2 bg-[#E50914] hover:bg-[#c0000c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-[2px] transition-all text-center"
                        >
                          Confirmar
                        </button>
                      </div>
                      <button
                        onClick={() => setShowSnacks(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#71717A] hover:text-white transition-colors"
                      >
                        <Utensils className="w-4 h-4" />
                        Agregar snacks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Snacks Modal */}
            {showSnacks && (
              <Modal isOpen={true} onClose={() => setShowSnacks(false)}>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-[#333333] mb-6">
                    <h3 className="text-lg font-bold text-white">Snacks</h3>
                    <button
                      onClick={() => setShowSnacks(false)}
                      className="text-[#71717A] hover:text-white transition-colors text-sm"
                    >
                      Cerrar
                    </button>
                  </div>
                  {snacks.filter((s) => s.disponible).length === 0 ? (
                    <p className="text-[#71717A] text-sm">No hay snacks disponibles.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {snacks.filter((s) => s.disponible).map((snack) => {
                        const cartItem = cartSnacks.find((s) => s.snack._id === snack._id);
                        return (
                          <div key={snack._id} className="bg-[#0A0A0A] border border-[#333333] rounded-[2px] p-3 space-y-2">
                            <div>
                              <p className="text-sm font-bold text-white">{snack.nombre}</p>
                              <p className="text-xs text-[#71717A]">${snack.precio.toFixed(2)}</p>
                            </div>
                            {cartItem ? (
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => updateSnackCantidad(snack._id, cartItem.cantidad - 1)}
                                  className="w-8 h-8 rounded border border-[#333333] bg-[#1A1A1A] flex items-center justify-center text-white hover:border-[#E50914] transition-colors"
                                >
                                  <Minus className="w-[14px] h-[14px]" />
                                </button>
                                <span className="text-sm font-bold text-white">{cartItem.cantidad}</span>
                                <button
                                  onClick={() => addSnack(snack)}
                                  className="w-8 h-8 rounded border border-[#333333] bg-[#1A1A1A] flex items-center justify-center text-white hover:border-[#E50914] transition-colors"
                                >
                                  <Plus className="w-[14px] h-[14px]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addSnack(snack)}
                                className="w-full py-2 text-xs font-bold text-[#E50914] border border-[#E50914]/30 rounded-[2px] hover:bg-[rgba(229,9,20,0.1)] transition-colors"
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
              </Modal>
            )}
          </>
        )}
      </div>
    </div>
  );
}
