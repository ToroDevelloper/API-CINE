import { useEffect, useMemo, useState } from "react";
import { getSalas, type Sala } from "../../services/salaService";
import {
  getAsientosPorSala,
  createAsiento,
  updateAsiento,
  deleteAsiento,
  type Asiento,
} from "../../services/asientoService";
import ProtectedRoute from "../../components/ProtectedRoute";
import { ChevronDown, Plus, X } from "lucide-react";

export default function Asientos() {
  return (
    <ProtectedRoute requireAdmin>
      <AsientosContent />
    </ProtectedRoute>
  );
}

const FILAS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TIPOS = ["normal", "vip", "preferencial", "pareja", "accesible"];

function getSeatTypeLabel(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t === "vip") return "vip";
  if (t === "pareja") return "pareja";
  if (t === "preferencial" || t === "accesible" || t === "discapacitado") return "accesible";
  return "normal";
}

function getSeatStyle(tipo: string) {
  const type = getSeatTypeLabel(tipo);
  if (type === "vip") return "bg-[#001B3C] border-[#0072D7] text-[#A7C8FF]";
  if (type === "pareja") return "bg-[rgba(255,180,170,0.1)] border-[rgba(255,180,170,0.5)] text-[#FFB4AA]";
  if (type === "accesible") return "bg-transparent border-dashed border-[#71717A] text-[#A1A1AA]";
  return "bg-[#2A2A2A] border-[#333333] text-[#A1A1AA]";
}

function getSeatSize(tipo: string, compact = false) {
  const type = getSeatTypeLabel(tipo);
  if (compact) {
    if (type === "vip") return "w-[36px] h-[36px] rounded-[6px_6px_4px_4px]";
    if (type === "pareja") return "w-[64px] h-[28px] rounded-[3px_3px_2px_2px]";
    return "w-[28px] h-[28px] rounded-[3px_3px_2px_2px]";
  }
  if (type === "vip") return "w-[48px] h-[48px] rounded-[8px_8px_6px_6px]";
  if (type === "pareja") return "w-[96px] h-[40px] rounded-[4px_4px_2px_2px]";
  return "w-[40px] h-[40px] rounded-[4px_4px_2px_2px]";
}

function getRowLabelColor(fila: string, asientosPorFila: Record<string, Asiento[]>) {
  const seats = asientosPorFila[fila] || [];
  if (seats.length === 0) return "text-[#52525B]";
  const type = getSeatTypeLabel(seats[0].tipo);
  if (type === "vip") return "text-[#A7C8FF]";
  if (type === "pareja") return "text-[#FFB4AA]";
  return "text-[#52525B]";
}

type SeatForm = {
  fila: string;
  numero: number;
  tipo: string;
};

const emptyForm: SeatForm = { fila: "A", numero: 1, tipo: "normal" };

function AsientosContent() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [selectedSala, setSelectedSala] = useState<string>("");
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAsientos, setIsLoadingAsientos] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAsiento, setEditingAsiento] = useState<Asiento | null>(null);
  const [form, setForm] = useState<SeatForm>(emptyForm);

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

  const grupoStats = useMemo(() => {
    const stats: Record<string, number> = { normal: 0, vip: 0, pareja: 0, accesible: 0 };
    asientos.forEach(a => {
      stats[getSeatTypeLabel(a.tipo)] = (stats[getSeatTypeLabel(a.tipo)] || 0) + 1;
    });
    return stats;
  }, [asientos]);

  const selectedSalaObj = salas.find(s => s._id === selectedSala);

  const openCreate = () => {
    setEditingAsiento(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (asiento: Asiento) => {
    setEditingAsiento(asiento);
    setForm({ fila: asiento.fila, numero: asiento.numero, tipo: asiento.tipo });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedSala) return;
    setError("");
    try {
      if (editingAsiento) {
        const updated = await updateAsiento(editingAsiento._id, {
          fila: form.fila.toUpperCase(),
          numero: form.numero,
          tipo: form.tipo,
        });
        setAsientos(prev => prev.map(a => a._id === editingAsiento._id ? updated : a));
      } else {
        const created = await createAsiento({
          sala_id: selectedSala,
          fila: form.fila.toUpperCase(),
          numero: form.numero,
          tipo: form.tipo,
        });
        setAsientos(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando asiento");
    }
  };

  const handleDelete = async (asiento: Asiento) => {
    if (!confirm(`¿Eliminar asiento ${asiento.fila}${asiento.numero}?`)) return;
    setError("");
    try {
      await deleteAsiento(asiento._id);
      setAsientos(prev => prev.filter(a => a._id !== asiento._id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando asiento");
    }
  };

  return (
    <div className="min-h-full">
      {(error) && (
        <div className="p-6 pb-0">
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-6 py-[96px_80px_48px] space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
              Asientos
            </h1>
            <p className="text-[18px] text-[#A1A1AA] mt-1 leading-[1.6] max-w-[420px]">
              Visualizar y gestionar la distribución de asientos por sala.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-2 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-bold rounded-[2px] transition-all shadow-[0_4px_14px_rgba(229,9,20,0.39)]"
            >
              <Plus className="w-4 h-4" />
              Nuevo Asiento
            </button>
            <div className="relative">
              <select
                value={selectedSala}
                onChange={(e) => setSelectedSala(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] transition-colors min-w-[220px]"
              >
                {salas.map(s => (
                  <option key={s._id} value={s._id}>{s.nombre} ({s.capacidad} asientos)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-[#999999] text-base">Cargando salas...</p>
        ) : salas.length === 0 ? (
          <p className="text-[#999999] text-base">No hay salas disponibles.</p>
        ) : (
          <div className="flex gap-6">
            {/* Left: Seat Grid */}
            <div className="flex-1 min-w-0">
              {isLoadingAsientos ? (
                <p className="text-[#999999] text-base">Cargando asientos...</p>
              ) : asientos.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-16 text-center">
                  <p className="text-[#999999] text-base mb-4">No hay asientos configurados para esta sala.</p>
                  <button
                    onClick={openCreate}
                    className="px-4 py-3 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-bold rounded-[2px] transition-all"
                  >
                    Crear Primer Asiento
                  </button>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-6 overflow-x-auto">
                  {/* Screen */}
                  <div className="flex flex-col items-center pb-12">
                    <div className="w-[374px] h-[32px] bg-gradient-to-b from-[#3F3F46] to-transparent opacity-70 rounded-t-full shadow-[0_20px_50px_rgba(255,255,255,0.1)]" />
                    <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase mt-2">Pantalla</span>
                  </div>

                  {/* Seat Rows */}
                  <div className="space-y-4">
                    {FILAS.map(fila => {
                      const filaAsientos = asientosPorFila[fila] || [];
                      if (filaAsientos.length === 0) return null;
                      const midpoint = Math.ceil(filaAsientos.length / 2);
                      const leftSeats = filaAsientos.slice(0, midpoint);
                      const rightSeats = filaAsientos.slice(midpoint);
                      const maxPerSide = Math.max(leftSeats.length, rightSeats.length);
                      const compact = maxPerSide > 5;
                      return (
                        <div key={fila} className="flex items-center justify-center gap-4">
                          <span className={`w-[14px] text-center text-xs font-bold ${getRowLabelColor(fila, asientosPorFila)}`}>
                            {fila}
                          </span>
                          <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
                            {leftSeats.map((a) => {
                              const type = getSeatTypeLabel(a.tipo);
                              return (
                                <div key={a._id} className="relative group">
                                  <button
                                    onClick={() => openEdit(a)}
                                    title={`${fila}${a.numero} · ${a.tipo} · Click para editar`}
                                    className={`flex items-center justify-center border font-bold ${compact ? "text-[10px]" : "text-xs"} transition-all hover:ring-2 hover:ring-[#E50914]/50 ${getSeatSize(a.tipo, compact)} ${getSeatStyle(a.tipo)}`}
                                  >
                                    {type === "pareja" ? `${a.numero}-${a.numero + 1}` : a.numero}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(a); }}
                                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#E50914] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  >
                                    <X className="w-2 h-2 text-white" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          {leftSeats.length > 0 && rightSeats.length > 0 && (
                            <span className="w-2" />
                          )}
                          <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
                            {rightSeats.map((a) => {
                              const type = getSeatTypeLabel(a.tipo);
                              return (
                                <div key={a._id} className="relative group">
                                  <button
                                    onClick={() => openEdit(a)}
                                    title={`${fila}${a.numero} · ${a.tipo} · Click para editar`}
                                    className={`flex items-center justify-center border font-bold ${compact ? "text-[10px]" : "text-xs"} transition-all hover:ring-2 hover:ring-[#E50914]/50 ${getSeatSize(a.tipo, compact)} ${getSeatStyle(a.tipo)}`}
                                  >
                                    {type === "pareja" ? `${a.numero}-${a.numero + 1}` : a.numero}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(a); }}
                                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#E50914] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  >
                                    <X className="w-2 h-2 text-white" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <span className={`w-[14px] text-center text-xs font-bold ${getRowLabelColor(fila, asientosPorFila)}`}>
                            {fila}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-8 flex items-center gap-6 px-6 py-3 bg-[rgba(10,10,10,0.8)] border border-[#333333] backdrop-blur-sm rounded-[12px] flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#2A2A2A] border border-[#333333] rounded-t-[2px]" />
                      <span className="text-xs text-[#A1A1AA]">Normal ({grupoStats.normal || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#001B3C] border border-[#0072D7] rounded-t-[2px]" />
                      <span className="text-xs text-[#A1A1AA]">VIP ({grupoStats.vip || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 bg-[rgba(255,180,170,0.1)] border border-[rgba(255,180,170,0.5)] rounded-t-[2px]" />
                      <span className="text-xs text-[#A1A1AA]">Pareja ({grupoStats.pareja || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-dashed border-[#71717A] rounded-t-[2px]" />
                      <span className="text-xs text-[#A1A1AA]">Accesible ({grupoStats.accesible || 0})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info Sidebar */}
            <div className="w-[216px] flex-shrink-0">
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-6 sticky top-24 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
                  <h3 className="text-xl text-white font-normal">Asientos</h3>
                  <span className="px-2 py-1 bg-[#E50914] rounded-[2px] text-xs font-bold tracking-[0.05em] uppercase text-white">
                    Admin
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Sala</label>
                  <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                    <span className="text-base text-white">{selectedSalaObj?.nombre || "—"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Capacidad</label>
                  <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                    <span className="text-base font-bold text-white">{selectedSalaObj?.capacidad || "—"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#333333] space-y-3">
                  <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Totales</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Registrados</span>
                      <span className="text-white font-bold">{asientos.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Filas</span>
                      <span className="text-white font-bold">{FILAS.filter(f => (asientosPorFila[f]?.length || 0) > 0).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Disponibles</span>
                      <span className="text-white font-bold">{Math.max(0, (selectedSalaObj?.capacidad || 0) - asientos.length)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-[8px] p-6 w-full max-w-[400px] space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <h3 className="text-xl font-bold text-white">
                {editingAsiento ? "Editar Asiento" : "Nuevo Asiento"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#71717A] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Sala</label>
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px]">
                  <span className="text-base text-white">{selectedSalaObj?.nombre || "—"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Fila</label>
                  <select
                    value={form.fila}
                    onChange={(e) => setForm({ ...form, fila: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  >
                    {FILAS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Número</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase mb-2">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-[2px] text-base text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                >
                  {TIPOS.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-[#333333]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-[#333333] rounded-[2px] text-sm text-white hover:bg-[#0A0A0A] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-bold rounded-[2px] transition-all"
              >
                {editingAsiento ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
