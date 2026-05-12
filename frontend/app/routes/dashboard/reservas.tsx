import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { cancelarReserva, getMisReservas, type Reserva } from "../../services/cineService";
import { useAuthStore } from "../../stores/useAuthStore";
import { LoadingSpinner } from "../../components/Notifications";
import { useAppToast } from "../../components/ToastProvider";
import { Modal } from "../../components/ui/Modal";
import {
  Armchair,
  CalendarDays,
  ChevronRight,
  Clock,
  Film,
  User,
  AlertTriangle,
} from "lucide-react";

function formatDateShort(fechaISO: string) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(fechaISO: string) {
  const d = new Date(fechaISO);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function Reservas() {
  const { addToast } = useAppToast();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  if (user?.rol === "admin") return null;

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detailReserva, setDetailReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await getMisReservas();
        if (!alive) return;
        setReservas(data);
      } catch (e) {
        if (!alive) return;
        try { addToast({ type: "error", title: e instanceof Error ? e.message : "Error cargando reservas" }); } catch {}
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleCancelar = async () => {
    if (!cancelId) return;
    try {
      await cancelarReserva(cancelId);
      const data = await getMisReservas();
      setReservas(data);
      setCancelId(null);
      try { addToast({ type: "success", title: "Reserva cancelada" }); } catch {}
    } catch (e) {
      try { addToast({ type: "error", title: e instanceof Error ? e.message : "Error cancelando" }); } catch {}
    }
  };

  const stats = useMemo(() => {
    const activas = reservas.filter(
      (r) => r.estado === "confirmada" || r.estado === "pendiente"
    ).length;
    return { total: reservas.length, activas };
  }, [reservas]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center py-16">
        <LoadingSpinner size="lg" text="Cargando reservas..." />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="max-w-[1024px] mx-auto px-[80px] py-[96px_80px_48px] space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end pb-6 border-b border-[#C4C4C4]">
          <div>
            <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
              Reservas
            </h1>
            <p className="text-[18px] text-[#C4C4C4] mt-1 leading-[1.6]">
              Tus reservas registradas
            </p>
          </div>
          <div className="flex gap-4">
            <div className="border border-white bg-black rounded-[4px] px-4 py-2">
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#C4C4C4] uppercase">Activas</p>
              <p className="text-[24px] font-bold text-[#FF000D]">{stats.activas}</p>
            </div>
            <div className="border border-white bg-black rounded-[4px] px-4 py-2">
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#C4C4C4] uppercase">Total</p>
              <p className="text-[24px] font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Ticket Grid */}
        {reservas.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-[#A1A1AA] text-lg">Aún no tienes reservas.</p>
            <button
              onClick={() => navigate("/dashboard/peliculas")}
              className="px-6 py-3 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-bold rounded-[2px] transition-all"
            >
              Explorar Películas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {reservas.map((r) => (
              <TicketCard
                key={r._id}
                reserva={r}
                userName={user?.nombre || "Usuario"}
                onCancel={setCancelId}
                onViewDetails={setDetailReserva}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation */}
      {cancelId && (
        <Modal isOpen={true} onClose={() => setCancelId(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancelar Reserva</h3>
            </div>
            <p className="text-sm text-[#71717A]">
              ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelId(null)}
                className="px-4 py-2 bg-[#0A0A0A] border border-[#333333] text-[#71717A] hover:text-white rounded-lg transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Details Modal */}
      {detailReserva && <DetailModal reserva={detailReserva} onClose={() => setDetailReserva(null)} />}
    </div>
  );
}

/* ─── Ticket Card ─────────────────────────────────────── */

function TicketCard({
  reserva,
  userName,
  onCancel,
  onViewDetails,
}: {
  reserva: Reserva;
  userName: string;
  onCancel: (id: string) => void;
  onViewDetails: (r: Reserva) => void;
}) {
  const isCancelled = reserva.estado === "cancelada";
  const funcion = reserva.funcion_id;
  const pelicula = funcion?.pelicula_id;
  const sala = funcion?.sala_id;
  const titulo = pelicula?.titulo ?? "Reserva";
  const poster = pelicula?.poster_url;
  const fecha = funcion?.fecha_hora ? formatDateShort(funcion.fecha_hora) : "";
  const hora = funcion?.fecha_hora ? formatTime(funcion.fecha_hora) : "";
  const salaNombre = sala?.nombre ?? "";
  const asientos = reserva.asientos_ids ?? [];
  const estadoLabel =
    reserva.estado === "confirmada"
      ? "Activa"
      : reserva.estado === "cancelada"
      ? "Cancelada"
      : "Pendiente";

  const [imgError, setImgError] = useState(false);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-black border-2 ${isCancelled ? "border-white opacity-75" : "border-[#999999]"} rounded-[10px] flex flex-row overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]`}
    >
      {/* Poster */}
      <div className="w-[139px] flex-shrink-0 relative overflow-hidden min-h-[200px]">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={titulo}
            className={`w-full h-full object-cover ${isCancelled ? "grayscale opacity-50" : ""}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-[#575757] text-2xl font-bold">{getInitials(titulo)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(46,26,24,0.5)] to-[#2E1A18] pointer-events-none" />
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border backdrop-blur-sm rounded-[2px] text-[12px] font-bold tracking-[1.2px] text-white bg-[rgba(151,113,0,0.9)] border-[#999999]">
            {estadoLabel}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 border-l border-dashed border-[#999999] rounded-r-[8px] p-6 flex flex-col justify-between min-w-0">
        <div className="space-y-4">
          <div>
            <h3
              className={`text-[24px] font-bold ${isCancelled ? "text-[#575757] line-through" : "text-white"}`}
            >
              {titulo}
            </h3>
            {(fecha || salaNombre) && (
              <div className="flex items-center gap-4 mt-1">
                {fecha && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className={`w-[13.5px] h-[15px] ${isCancelled ? "text-[#575757]" : "text-white"}`} />
                    <span className={`text-[16px] ${isCancelled ? "text-[#575757]" : "text-white"}`}>
                      {fecha} {hora}
                    </span>
                  </div>
                )}
                {salaNombre && (
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-[15px] h-[15px] ${isCancelled ? "text-[#575757]" : "text-white"}`} />
                    <span className={`text-[16px] ${isCancelled ? "text-[#575757]" : "text-white"}`}>
                      {salaNombre}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-0.5 rounded-[12px] text-[12px] font-bold tracking-[1.2px] text-white ${
                isCancelled ? "bg-[#582327]" : "bg-[#FF1D00]"
              }`}
            >
              {estadoLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#575757]">ID RESERVA</p>
              <p className={`font-['Liberation_Mono',monospace] text-[16px] truncate ${isCancelled ? "text-[#575757]" : "text-white"}`}>
                {reserva._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#575757]">USUARIO</p>
              <div className="flex items-center gap-2">
                <User className={`w-[13.33px] h-[13.33px] ${isCancelled ? "text-[#575757]" : "text-white"}`} />
                <span className={`text-[16px] ${isCancelled ? "text-[#575757]" : "text-white"}`}>
                  {userName}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#575757]">ASIENTOS</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {asientos.length === 0 ? (
                  <span className={`text-[14px] ${isCancelled ? "text-[#575757]" : "text-white"}`}>—</span>
                ) : (
                  asientos.map((a) => (
                    <span
                      key={a._id}
                      className={`px-2 py-0.5 rounded-[2px] text-[14px] font-['Liberation_Mono',monospace] text-white ${
                        isCancelled ? "bg-[rgba(115,115,115,0.5)]" : "bg-[#575757]"
                      }`}
                    >
                      {a.fila}{a.numero}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-[1.2px] text-[#575757]">TOTAL</p>
              <p className={`text-[18px] font-bold ${isCancelled ? "text-[#575757]" : "text-white"}`}>
                ${reserva.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 mt-4 border-t border-[#575757]">
          <div />
          <div className="flex items-center gap-2">
            {reserva.estado !== "cancelada" && (
              <button
                onClick={() => onCancel(reserva._id)}
                className="px-4 py-2 border border-[#999999] rounded-[2px] text-[12px] font-bold tracking-[1.2px] text-white hover:bg-[#0A0A0A] transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => onViewDetails(reserva)}
              className="flex items-center gap-2 px-4 py-2 border border-[#999999] rounded-[2px] text-[12px] font-bold tracking-[1.2px] text-white hover:bg-[#0A0A0A] transition-colors"
            >
              Ver Detalles
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Modal ────────────────────────────────────── */

function DetailModal({ reserva, onClose }: { reserva: Reserva; onClose: () => void }) {
  const funcion = reserva.funcion_id;
  const pelicula = funcion?.pelicula_id;
  const sala = funcion?.sala_id;
  const asientos = reserva.asientos_ids ?? [];
  const estadoColor =
    reserva.estado === "confirmada"
      ? "text-green-400"
      : reserva.estado === "cancelada"
      ? "text-red-400"
      : "text-yellow-300";

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-6 space-y-5 max-w-[500px]">
        <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
          <h3 className="text-xl font-bold text-white">Detalle de Reserva</h3>
          <button onClick={onClose} className="text-[#71717A] hover:text-white transition-colors text-sm">
            Cerrar
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-[#E50914]" />
            <div>
              <p className="text-sm text-[#71717A]">Película</p>
              <p className="text-base text-white font-bold">{pelicula?.titulo || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#E50914]" />
            <div>
              <p className="text-sm text-[#71717A]">Función</p>
              <p className="text-base text-white">
                {funcion?.fecha_hora ? formatDateShort(funcion.fecha_hora) + " " + formatTime(funcion.fecha_hora) : "—"} · {sala?.nombre || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${reserva.estado === "cancelada" ? "text-red-400" : "text-green-400"}`} />
            <div>
              <p className="text-sm text-[#71717A]">Estado</p>
              <p className={`text-base font-bold capitalize ${estadoColor}`}>{reserva.estado}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-[#71717A] mb-2">Asientos</p>
            <div className="flex flex-wrap gap-2">
              {asientos.length === 0 ? (
                <span className="text-[#575757]">—</span>
              ) : (
                asientos.map((a) => (
                  <span
                    key={a._id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-sm text-white"
                  >
                    <Armchair className="w-3.5 h-3.5 text-[#E50914]" />
                    {a.fila}{a.numero}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
            <span className="text-base text-[#71717A]">Total</span>
            <span className="text-2xl font-bold text-white">${reserva.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
