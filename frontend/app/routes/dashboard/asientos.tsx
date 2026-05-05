import { useEffect, useMemo, useState } from "react";
import { getSalas, type Sala } from "../../services/salaService";
import { getAsientosPorSala, type Asiento } from "../../services/asientoService";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Asientos() {
  return (
    <ProtectedRoute requireAdmin>
      <AsientosContent />
    </ProtectedRoute>
  );
}

const FILAS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const TIPO_COLORS: Record<string, string> = {
  normal: "bg-[#27272A] border-[#585858] text-white",
  preferencial: "bg-[#90120A] border-[#E50914] text-white",
  vip: "bg-purple-900/50 border-purple-500/50 text-purple-200",
};

function AsientosContent() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [selectedSala, setSelectedSala] = useState<string>("");
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAsientos, setIsLoadingAsientos] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getSalas();
        if (!alive) return;
        setSalas(data.filter(s => s.activa));
        if (data.length > 0) {
          setSelectedSala(data[0]._id);
        }
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando salas");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedSala) return;
    let alive = true;
    (async () => {
      setIsLoadingAsientos(true);
      setError("");
      try {
        const data = await getAsientosPorSala(selectedSala);
        if (!alive) return;
        setAsientos(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando asientos");
      } finally {
        if (!alive) return;
        setIsLoadingAsientos(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedSala]);

  const asientosPorFila = useMemo(() => {
    const map: Record<string, Asiento[]> = {};
    FILAS.forEach(f => { map[f] = []; });
    asientos.forEach(a => {
      if (map[a.fila]) {
        map[a.fila].push(a);
      }
    });
    Object.keys(map).forEach(f => {
      map[f].sort((a, b) => a.numero - b.numero);
    });
    return map;
  }, [asientos]);

  const getTipoStats = () => {
    const stats: Record<string, number> = { normal: 0, preferencial: 0, vip: 0 };
    asientos.forEach(a => {
      if (stats[a.tipo] !== undefined) stats[a.tipo]++;
    });
    return stats;
  };

  const tipoStats = getTipoStats();

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Asientos
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Visualizar y gestionar la distribución de asientos por sala.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando salas...</p>
      ) : salas.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay salas disponibles.</p>
      ) : (
        <>
          <div className="flex items-center gap-[24px] flex-wrap">
            <select
              value={selectedSala}
              onChange={(e) => setSelectedSala(e.target.value)}
              className="px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
            >
              {salas.map(s => (
                <option key={s._id} value={s._id}>{s.nombre} ({s.capacidad} asientos)</option>
              ))}
            </select>

            <div className="flex items-center gap-[16px]">
              {Object.entries(TIPO_COLORS).map(([tipo, colorClass]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <div className={`w-[24px] h-[24px] border rounded-[2px] ${colorClass}`} />
                  <span className="text-[14px] text-[#D4D4D4] capitalize">{tipo}</span>
                  <span className="text-[12px] text-[#999999]">({tipoStats[tipo] || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {isLoadingAsientos ? (
            <p className="text-[#999999] text-[16px]">Cargando asientos...</p>
          ) : asientos.length === 0 ? (
            <p className="text-[#999999] text-[16px]">No hay asientos configurados para esta sala.</p>
          ) : (
            <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-8 overflow-x-auto">
              <div className="space-y-[12px] min-w-[600px]">
                <div className="text-center mb-6">
                  <div className="w-full h-[8px] bg-[#E50914] rounded-full mb-2" />
                  <span className="text-[12px] font-bold text-[#999999] tracking-[0.2em] uppercase">Pantalla</span>
                </div>

                {FILAS.map(fila => (
                  <div key={fila} className="flex items-center gap-[12px]">
                    <span className="w-[24px] text-[14px] font-bold text-[#999999] text-right">{fila}</span>
                    <div className="flex gap-[8px] flex-wrap">
                      {asientosPorFila[fila]?.map(asiento => (
                        <div
                          key={asiento._id}
                          title={`${fila}${asiento.numero} - ${asiento.tipo}`}
                          className={`w-[36px] h-[36px] flex items-center justify-center border rounded-[2px] text-[10px] font-bold transition-all hover:scale-110 ${
                            TIPO_COLORS[asiento.tipo] || TIPO_COLORS.normal
                          }`}
                        >
                          {asiento.numero}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#585858]">
                <p className="text-[14px] text-[#999999]">
                  Total: <span className="text-white font-bold">{asientos.length}</span> asientos
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
