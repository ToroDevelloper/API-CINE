import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { getPedidosSnacks, type PedidoSnack } from "../../services/pedidoSnackService";
import ProtectedRoute from "../../components/ProtectedRoute";

const ESTADOS = ["pendiente", "preparando", "listo", "entregado", "cancelado"];

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  preparando: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  listo: "bg-green-500/20 text-green-400 border-green-500/50",
  entregado: "bg-[#E50914]/20 text-[#E50914] border-[#E50914]/50",
  cancelado: "bg-[#27272A] text-[#999999] border-[#585858]",
};

export default function Pedidos() {
  return (
    <ProtectedRoute requireAdmin>
      <PedidosContent />
    </ProtectedRoute>
  );
}

function PedidosContent() {
  const [pedidos, setPedidos] = useState<PedidoSnack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPedidosSnacks();
        if (!alive) return;
        setPedidos(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando pedidos");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const getNombreUsuario = (pedido: PedidoSnack) => {
    return typeof pedido.usuario_id === 'object' ? pedido.usuario_id?.nombre || 'N/A' : 'N/A';
  };

  const filteredPedidos = useMemo(() => {
    let result = pedidos;
    if (filtroEstado !== "todos") {
      result = result.filter(p => p.estado === filtroEstado);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => {
        const usuario = getNombreUsuario(p);
        return usuario.toLowerCase().includes(term) ||
          p._id.toLowerCase().includes(term);
      });
    }
    return result;
  }, [pedidos, searchTerm, filtroEstado]);

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    try {
      setPedidos(prev => prev.map(p => p._id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error actualizando estado");
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalItems = (pedido: PedidoSnack) => {
    return pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
  };

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Pedidos
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Gestionar pedidos de snacks y su estado de preparación.
          </p>
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
            placeholder="Buscar por usuario o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
          />
        </div>

        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-[16px] py-[6px] rounded-[12px] text-[12px] font-bold tracking-[0.1em] transition-all ${
              filtroEstado === "todos"
                ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                : "bg-[#200E0C] border border-[#5E3F3B] text-[#FFDAD5] hover:border-[#AF8782]"
            }`}
          >
            Todos
          </button>
          {ESTADOS.map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-[16px] py-[6px] rounded-[12px] text-[12px] font-bold tracking-[0.1em] transition-all capitalize ${
                filtroEstado === estado
                  ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                  : "bg-[#200E0C] border border-[#5E3F3B] text-[#FFDAD5] hover:border-[#AF8782]"
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando pedidos...</p>
      ) : filteredPedidos.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay pedidos disponibles.</p>
      ) : (
        <div className="space-y-[16px]">
          {filteredPedidos.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 hover:border-[#E50914] transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-[20px] font-bold text-white">
                    Pedido #{pedido._id.slice(-6)}
                  </h3>
                  <p className="text-[14px] text-[#999999] mt-1">
                    {formatFecha(pedido.fecha_pedido)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] border ${ESTADO_COLORS[pedido.estado] || ESTADO_COLORS.pendiente}`}>
                    {pedido.estado.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-[14px] text-[#D4D4D4]">
                    <span className="text-[#999999]">Cliente:</span> {getNombreUsuario(pedido)}
                  </p>
                  <p className="text-[14px] text-[#D4D4D4] mt-1">
                    <span className="text-[#999999]">Items:</span> {getTotalItems(pedido)} productos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[24px] font-bold text-white">${pedido.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[14px]">
                    <span className="text-[#D4D4D4]">
                      {item.cantidad}x {typeof item.snack_id === 'object' ? item.snack_id?.nombre || 'N/A' : 'Snack'}
                    </span>
                    <span className="text-white">${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#999999]">
                <div className="flex items-center gap-2">
                  {pedido.estado === "pendiente" && (
                    <button
                      onClick={() => handleUpdateEstado(pedido._id, "preparando")}
                      className="flex items-center gap-2 px-[16px] py-[8px] bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-[2px] text-[12px] font-bold text-blue-400 transition-all"
                    >
                      <Clock className="w-[14px] h-[14px]" />
                      PREPARAR
                    </button>
                  )}
                  {pedido.estado === "preparando" && (
                    <button
                      onClick={() => handleUpdateEstado(pedido._id, "listo")}
                      className="flex items-center gap-2 px-[16px] py-[8px] bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-[2px] text-[12px] font-bold text-green-400 transition-all"
                    >
                      <CheckCircle className="w-[14px] h-[14px]" />
                      LISTO
                    </button>
                  )}
                  {pedido.estado === "listo" && (
                    <button
                      onClick={() => handleUpdateEstado(pedido._id, "entregado")}
                      className="flex items-center gap-2 px-[16px] py-[8px] bg-[#E50914]/20 hover:bg-[#E50914]/30 border border-[#E50914]/50 rounded-[2px] text-[12px] font-bold text-[#E50914] transition-all"
                    >
                      <Truck className="w-[14px] h-[14px]" />
                      ENTREGAR
                    </button>
                  )}
                </div>
                {(pedido.estado === "pendiente" || pedido.estado === "preparando") && (
                  <button
                    onClick={() => handleUpdateEstado(pedido._id, "cancelado")}
                    className="flex items-center gap-2 px-[16px] py-[8px] bg-[#27272A] hover:bg-[#3F3F46] rounded-[2px] text-[12px] font-bold text-[#999999] transition-all"
                  >
                    <XCircle className="w-[14px] h-[14px]" />
                    CANCELAR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
