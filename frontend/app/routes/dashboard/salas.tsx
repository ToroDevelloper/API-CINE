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

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Salas
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Gestionar salas de cine, capacidad y configuración de tipos.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-[12px] px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white rounded-[2px] transition-all shadow-[0_0_20px_rgba(229,9,20,0.2)]"
        >
          <Plus className="w-[16px] h-[16px]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.1em]">NEW ROOM</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      <div className="relative max-w-[400px]">
        <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#E9BCB6]" />
        <input
          type="text"
          placeholder="Buscar por nombre o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
        />
      </div>

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando salas...</p>
      ) : filteredSalas.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay salas disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {filteredSalas.map((sala) => (
            <div
              key={sala._id}
              className={`bg-[#060606] border ${sala.activa ? "border-[#585858]" : "border-[#27272A] opacity-60"} rounded-[4px] overflow-hidden transition-all hover:border-[#E50914]`}
            >
              <div className="p-6 space-y-[16px]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[24px] font-bold text-white leading-[1.3]">{sala.nombre}</h3>
                  <button
                    onClick={() => handleToggleActiva(sala)}
                    className={`w-[36px] h-[36px] rounded-[12px] flex items-center justify-center transition-all ${
                      sala.activa ? "bg-[#90120A] hover:bg-[#E50914]" : "bg-[#27272A] hover:bg-[#3F3F46]"
                    }`}
                  >
                    <div className={`w-[12px] h-[12px] rounded-full ${sala.activa ? "bg-white" : "bg-[#585858]"}`} />
                  </button>
                </div>

                <div className="flex items-center gap-[12px] flex-wrap">
                  <span className={`px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] border ${getTipoColor(sala.tipo)}`}>
                    {sala.tipo.toUpperCase()}
                  </span>
                  <span className={`px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] ${
                    sala.activa ? "bg-white text-[#0A0A0A]" : "bg-[#27272A] text-[#999999]"
                  }`}>
                    {sala.activa ? "ACTIVA" : "INACTIVA"}
                  </span>
                </div>

                <p className="text-[16px] text-[#D4D4D4]">
                  <span className="font-bold text-white">{sala.capacidad}</span> asientos
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#999999]">
                  <span className="text-[14px] text-[#999999]">
                    ID: {sala._id.slice(-6)}
                  </span>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => openModal(sala)}
                      className="w-[36px] h-[36px] rounded-[12px] bg-[#90120A] hover:bg-[#E50914] flex items-center justify-center transition-all"
                    >
                      <Edit2 className="w-[16px] h-[16px] text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(sala._id)}
                      className="w-[36px] h-[36px] rounded-[12px] bg-[#27272A] hover:bg-[#3F3F46] flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-[#A1A1AA]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
