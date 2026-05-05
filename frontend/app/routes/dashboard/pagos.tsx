import { useEffect, useMemo, useState } from "react";
import { Search, Calendar } from "lucide-react";
import { getPagos, type Pago } from "../../services/pagoService";
import ProtectedRoute from "../../components/ProtectedRoute";

const ESTADOS_PAGO = ["pendiente", "completado", "fallido", "reembolsado"];

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  completado: "bg-green-500/20 text-green-400 border-green-500/50",
  fallido: "bg-red-500/20 text-red-400 border-red-500/50",
  reembolsado: "bg-[#27272A] text-[#999999] border-[#585858]",
};

const METODO_ICONS: Record<string, string> = {
  tarjeta: "💳",
  efectivo: "💵",
  transferencia: "🏦",
  qr: "📱",
};

export default function Pagos() {
  return (
    <ProtectedRoute requireAdmin>
      <PagosContent />
    </ProtectedRoute>
  );
}

function PagosContent() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPagos();
        if (!alive) return;
        setPagos(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando pagos");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const getNombreUsuario = (pago: Pago) => {
    return typeof pago.usuario_id === 'object' ? pago.usuario_id?.nombre || 'N/A' : 'N/A';
  };

  const getPeliculaTitulo = (pago: Pago) => {
    if (typeof pago.reserva_id === 'object' && pago.reserva_id?.funcion_id) {
      const funcion = pago.reserva_id.funcion_id;
      if (typeof funcion === 'object' && funcion.pelicula_id) {
        return typeof funcion.pelicula_id === 'object' ? funcion.pelicula_id.titulo : 'N/A';
      }
    }
    return null;
  };

  const filteredPagos = useMemo(() => {
    let result = pagos;
    if (filtroEstado !== "todos") {
      result = result.filter(p => p.estado === filtroEstado);
    }
    if (filtroMetodo !== "todos") {
      result = result.filter(p => p.metodo_pago === filtroMetodo);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => {
        const usuario = getNombreUsuario(p);
        return usuario.toLowerCase().includes(term) ||
          p._id.toLowerCase().includes(term) ||
          (getPeliculaTitulo(p) || "").toLowerCase().includes(term);
      });
    }
    return result;
  }, [pagos, searchTerm, filtroEstado, filtroMetodo]);

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalMonto = useMemo(() => {
    return filteredPagos
      .filter(p => p.estado === "completado")
      .reduce((sum, p) => sum + p.monto, 0);
  }, [filteredPagos]);

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Pagos
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Gestionar pagos, transacciones y reembolsos.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[14px] text-[#999999]">Total ingresos</p>
          <p className="text-[32px] font-bold text-[#E50914]">${totalMonto.toFixed(2)}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-[24px] flex-wrap">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#E9BCB6]" />
          <input
            type="text"
            placeholder="Buscar por usuario, película o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
          />
        </div>

        <div className="flex items-center gap-[12px] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#999999] tracking-[0.1em] uppercase">Estado:</span>
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-[12px] py-[4px] rounded-[12px] text-[11px] font-bold tracking-[0.05em] transition-all ${
                filtroEstado === "todos"
                  ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                  : "bg-[#200E0C] border border-[#5E3F3B] text-[#FFDAD5] hover:border-[#AF8782]"
              }`}
            >
              Todos
            </button>
            {ESTADOS_PAGO.map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-[12px] py-[4px] rounded-[12px] text-[11px] font-bold tracking-[0.05em] transition-all capitalize ${
                  filtroEstado === estado
                    ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                    : "bg-[#200E0C] border border-[#5E3F3B] text-[#FFDAD5] hover:border-[#AF8782]"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#999999] tracking-[0.1em] uppercase">Método:</span>
            {["todos", "tarjeta", "efectivo", "transferencia", "qr"].map(metodo => (
              <button
                key={metodo}
                onClick={() => setFiltroMetodo(metodo)}
                className={`px-[12px] py-[4px] rounded-[12px] text-[11px] font-bold tracking-[0.05em] transition-all ${
                  filtroMetodo === metodo
                    ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                    : "bg-[#200E0C] border border-[#5E3F3B] text-[#FFDAD5] hover:border-[#AF8782]"
                }`}
              >
                {metodo === "todos" ? "Todos" : metodo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando pagos...</p>
      ) : filteredPagos.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay pagos disponibles.</p>
      ) : (
        <div className="bg-[#060606] border border-[#585858] rounded-[4px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#585858]">
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">ID</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Usuario</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Película</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Monto</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Método</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Estado</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.map((pago) => (
                <tr key={pago._id} className="border-b border-[#2E1A18] hover:bg-[#0A0A0A] transition-colors">
                  <td className="p-4 text-[14px] text-[#999999]">#{pago._id.slice(-6)}</td>
                  <td className="p-4 text-[16px] text-white">{getNombreUsuario(pago)}</td>
                  <td className="p-4 text-[14px] text-[#D4D4D4]">
                    {getPeliculaTitulo(pago) || <span className="text-[#585858]">N/A</span>}
                  </td>
                  <td className="p-4 text-[16px] font-bold text-white">${pago.monto.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-[14px] text-[#D4D4D4]">
                      {METODO_ICONS[pago.metodo_pago] || "💳"} {pago.metodo_pago}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] border ${ESTADO_COLORS[pago.estado] || ESTADO_COLORS.pendiente}`}>
                      {pago.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-[14px] h-[14px] text-[#999999]" />
                      <span className="text-[14px] text-[#D4D4D4]">{formatFecha(pago.fecha_pago)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
