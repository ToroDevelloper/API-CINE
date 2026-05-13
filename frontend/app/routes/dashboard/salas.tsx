import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { getSalas, createSala, updateSala, deleteSala, type Sala } from "../../services/salaService";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Salas() {
  return (
    <ProtectedRoute requireAdmin>
      <SalasContent />
    </ProtectedRoute>
  );
}

function SalasContent() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [formData, setFormData] = useState({ nombre: "", capacidad: 50, tipo: "estandar", activa: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getSalas();
        if (!alive) return;
        setSalas(data);
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

  const filteredSalas = useMemo(() => {
    if (!searchTerm) return salas;
    const term = searchTerm.toLowerCase();
    return salas.filter(s =>
      s.nombre.toLowerCase().includes(term) ||
      s.tipo.toLowerCase().includes(term)
    );
  }, [salas, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sala?")) return;
    try {
      await deleteSala(id);
      setSalas(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando sala");
    }
  };

  const handleToggleActiva = async (sala: Sala) => {
    try {
      const updated = await updateSala(sala._id, { activa: !sala.activa });
      setSalas(prev => prev.map(s => s._id === sala._id ? updated : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error actualizando estado");
    }
  };

  const openModal = (sala?: Sala) => {
    if (sala) {
      setEditingSala(sala);
      setFormData({ nombre: sala.nombre, capacidad: sala.capacidad, tipo: sala.tipo, activa: sala.activa });
    } else {
      setEditingSala(null);
      setFormData({ nombre: "", capacidad: 50, tipo: "estandar", activa: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSala) {
        const updated = await updateSala(editingSala._id, formData);
        setSalas(prev => prev.map(s => s._id === editingSala._id ? updated : s));
      } else {
        const newSala = await createSala(formData);
        setSalas(prev => [...prev, newSala]);
      }
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando sala");
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "vip": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "premium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  const totalSalas = salas.length;
  const salasActivas = salas.filter(s => s.activa).length;
  const salasVip = salas.filter(s => s.tipo === "vip").length;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[36px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Salas
          </h1>
          <p className="text-[15px] text-[#B8B8B8] mt-1 leading-[1.6]">
            Gestionar salas de cine, capacidad y configuración de tipos.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-[10px] px-[20px] py-[10px] bg-[#E50914] hover:bg-[#c0000c] text-white rounded-lg transition-all shadow-[0_0_20px_rgba(229,9,20,0.2)]"
        >
          <Plus className="w-[16px] h-[16px]" />
          <span className="text-[13px] font-bold uppercase tracking-[0.08em]">Nueva Sala</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-bg-card border border-border-base rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 text-2xl font-bold">
            🎬
          </div>
          <div>
            <p className="text-[13px] text-text-dim uppercase tracking-wide font-semibold">Total Salas</p>
            <p className="text-[32px] font-extrabold text-white leading-tight">{totalSalas}</p>
          </div>
        </div>
        <div className="bg-bg-card border border-border-base rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center text-green-400 text-2xl font-bold">
            ✅
          </div>
          <div>
            <p className="text-[13px] text-text-dim uppercase tracking-wide font-semibold">Salas Activas</p>
            <p className="text-[32px] font-extrabold text-green-400 leading-tight">{salasActivas}</p>
          </div>
        </div>
        <div className="bg-bg-card border border-border-base rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 text-2xl font-bold">
            ⭐
          </div>
          <div>
            <p className="text-[13px] text-text-dim uppercase tracking-wide font-semibold">Salas VIP</p>
            <p className="text-[32px] font-extrabold text-purple-400 leading-tight">{salasVip}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-[400px]">
        <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-[#E9BCB6]" />
        <input
          type="text"
          placeholder="Buscar por nombre o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-[44px] pr-4 py-[10px] bg-bg-card border border-border-base rounded-lg text-[15px] text-white placeholder-text-dim focus:outline-none focus:border-primary-red transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-text-dim text-[15px]">Cargando salas...</p>
      ) : filteredSalas.length === 0 ? (
        <p className="text-text-dim text-[15px]">No hay salas disponibles.</p>
      ) : (
        <div className="bg-bg-card border border-border-base rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-bg-side border-b border-border-base">
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Nombre</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Tipo</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Capacidad</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Estado</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Acciones</span>
          </div>
          {/* Table Rows */}
          <div className="divide-y divide-border-base">
            {filteredSalas.map((sala) => (
              <div
                key={sala._id}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center transition-colors hover:bg-bg-side ${!sala.activa ? "opacity-60" : ""}`}
              >
                {/* Nombre */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-sm">
                    {sala.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-[15px]">{sala.nombre}</p>
                    <p className="text-text-dim text-[12px]">ID: {sala._id.slice(-6)}</p>
                  </div>
                </div>
                {/* Tipo */}
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${getTipoColor(sala.tipo)}`}>
                  {sala.tipo.toUpperCase()}
                </span>
                {/* Capacidad */}
                <span className="text-white font-semibold text-[15px]">
                  {sala.capacidad} <span className="text-text-dim font-normal text-[13px]">asientos</span>
                </span>
                {/* Estado */}
                <button
                  onClick={() => handleToggleActiva(sala)}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                    sala.activa
                      ? "bg-green-500/15 text-green-400 border border-green-500/40 hover:bg-green-500/25"
                      : "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40 hover:bg-zinc-700/60"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${sala.activa ? "bg-green-400" : "bg-zinc-400"}`} />
                  {sala.activa ? "Activa" : "Inactiva"}
                </button>
                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(sala)}
                    className="w-8 h-8 rounded-lg bg-primary-red/10 hover:bg-primary-red/20 flex items-center justify-center transition-all group"
                  >
                    <Edit2 className="w-4 h-4 text-primary-red group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => handleDelete(sala._id)}
                    className="w-8 h-8 rounded-lg bg-zinc-700/40 hover:bg-zinc-700/70 flex items-center justify-center transition-all group"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Footer count */}
          <div className="px-6 py-3 border-t border-border-base bg-bg-side">
            <p className="text-text-dim text-[12px]">{filteredSalas.length} sala{filteredSalas.length !== 1 ? "s" : ""} encontrada{filteredSalas.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 w-full max-w-[500px] space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[24px] font-bold text-white">
              {editingSala ? "Editar Sala" : "Nueva Sala"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Capacidad</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                >
                  <option value="estandar">Estándar</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[16px] text-white">
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    className="w-[18px] h-[18px] accent-[#E50914]"
                  />
                  Sala activa
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-[24px] py-[12px] bg-[#27272A] hover:bg-[#3F3F46] text-white text-[12px] font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white text-[12px] font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all"
                >
                  {editingSala ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
