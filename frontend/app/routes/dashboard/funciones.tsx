import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import { getFunciones, createFuncion, updateFuncion, deleteFuncion, type Funcion } from "../../services/funcionService";
import { getPeliculas, type Pelicula } from "../../services/cineService";
import { getSalas, getSala, type Sala } from "../../services/salaService";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Funciones() {
  return (
    <ProtectedRoute requireAdmin>
      <FuncionesContent />
    </ProtectedRoute>
  );
}

function FuncionesContent() {
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFuncion, setEditingFuncion] = useState<Funcion | null>(null);
  const [dropdownSalas, setDropdownSalas] = useState<Sala[]>([]);
  const [formData, setFormData] = useState({
    pelicula_id: "",
    sala_id: "",
    fecha_hora: "",
    precio_base: 50,
    idioma: "español",
    formato: "2D",
    activa: true,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const [funcionesData, peliculasData, salasData] = await Promise.all([
          getFunciones(),
          getPeliculas(),
          getSalas(),
        ]);
        if (!alive) return;
        setFunciones(funcionesData);
        setPeliculas(peliculasData);
        const activeSalas = salasData.filter(s => s.activa);
        setSalas(activeSalas);
        setDropdownSalas(activeSalas);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando datos");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filteredFunciones = useMemo(() => {
    if (!searchTerm) return funciones;
    const term = searchTerm.toLowerCase();
    return funciones.filter(f => {
      const peliculaTitulo = typeof f.pelicula_id === 'object' ? f.pelicula_id?.titulo || '' : '';
      const salaNombre = typeof f.sala_id === 'object' ? f.sala_id?.nombre || '' : '';
      return peliculaTitulo.toLowerCase().includes(term) ||
        salaNombre.toLowerCase().includes(term) ||
        f.formato.toLowerCase().includes(term);
    });
  }, [funciones, searchTerm]);

  const getNombrePelicula = (funcion: Funcion) => {
    return typeof funcion.pelicula_id === 'object' ? funcion.pelicula_id?.titulo || 'N/A' : 'N/A';
  };

  const getNombreSala = (funcion: Funcion) => {
    return typeof funcion.sala_id === 'object' ? funcion.sala_id?.nombre || 'N/A' : 'N/A';
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta función?")) return;
    try {
      await deleteFuncion(id);
      setFunciones(prev => prev.filter(f => f._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando función");
    }
  };

  const handleToggleActiva = async (funcion: Funcion) => {
    try {
      const updated = await updateFuncion(funcion._id, { activa: !funcion.activa });
      setFunciones(prev => prev.map(f => f._id === funcion._id ? updated : f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error actualizando estado");
    }
  };

  const openModal = async (funcion?: Funcion) => {
    if (funcion) {
      setEditingFuncion(funcion);
      const fechaLocal = new Date(funcion.fecha_hora);
      const fechaStr = fechaLocal.toISOString().slice(0, 16);
      const salaId = typeof funcion.sala_id === 'object' ? funcion.sala_id?._id || '' : funcion.sala_id;
      setFormData({
        pelicula_id: typeof funcion.pelicula_id === 'object' ? funcion.pelicula_id?._id || '' : funcion.pelicula_id,
        sala_id: salaId,
        fecha_hora: fechaStr,
        precio_base: funcion.precio_base,
        idioma: funcion.idioma,
        formato: funcion.formato,
        activa: funcion.activa,
      });
      if (salaId && !salas.some(s => s._id === salaId)) {
        try {
          const sala = await getSala(salaId);
          setDropdownSalas([...salas, sala]);
        } catch {
          setDropdownSalas(salas);
        }
      } else {
        setDropdownSalas(salas);
      }
    } else {
      setEditingFuncion(null);
      setFormData({ pelicula_id: "", sala_id: "", fecha_hora: "", precio_base: 50, idioma: "español", formato: "2D", activa: true });
      setDropdownSalas(salas);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFuncion) {
        const updated = await updateFuncion(editingFuncion._id, formData);
        setFunciones(prev => prev.map(f => f._id === editingFuncion._id ? updated : f));
      } else {
        const newFuncion = await createFuncion(formData);
        setFunciones(prev => [...prev, newFuncion]);
      }
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando función");
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatHora = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Funciones
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Gestionar funciones de películas, horarios y precios.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-[12px] px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white rounded-[2px] transition-all shadow-[0_0_20px_rgba(229,9,20,0.2)]"
        >
          <Plus className="w-[16px] h-[16px]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.1em]">NEW SHOWTIME</span>
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
          placeholder="Buscar por película, sala o formato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
        />
      </div>

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando funciones...</p>
      ) : filteredFunciones.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay funciones disponibles.</p>
      ) : (
        <div className="bg-[#060606] border border-[#585858] rounded-[4px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#585858]">
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Película</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Sala</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Fecha</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Hora</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Precio</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Formato</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Estado</th>
                <th className="text-right p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunciones.map((funcion) => (
                <tr key={funcion._id} className="border-b border-[#2E1A18] hover:bg-[#0A0A0A] transition-colors">
                  <td className="p-4 text-[16px] text-white font-medium">{getNombrePelicula(funcion)}</td>
                  <td className="p-4 text-[16px] text-[#D4D4D4]">{getNombreSala(funcion)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-[14px] h-[14px] text-[#999999]" />
                      <span className="text-[14px] text-[#D4D4D4]">{formatFecha(funcion.fecha_hora)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-[14px] h-[14px] text-[#999999]" />
                      <span className="text-[14px] text-[#D4D4D4]">{formatHora(funcion.fecha_hora)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[16px] text-white font-bold">${funcion.precio_base}</td>
                  <td className="p-4">
                    <span className="px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5] uppercase">
                      {funcion.formato}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActiva(funcion)}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-[12px] h-[12px] rounded-full ${funcion.activa ? "bg-[#E50914]" : "bg-[#585858]"}`} />
                      <span className={`text-[12px] font-bold ${funcion.activa ? "text-white" : "text-[#999999]"}`}>
                        {funcion.activa ? "ACTIVA" : "INACTIVA"}
                      </span>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-[8px]">
                      <button
                        onClick={() => openModal(funcion)}
                        className="w-[36px] h-[36px] rounded-[12px] bg-[#90120A] hover:bg-[#E50914] flex items-center justify-center transition-all"
                      >
                        <Edit2 className="w-[16px] h-[16px] text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(funcion._id)}
                        className="w-[36px] h-[36px] rounded-[12px] bg-[#27272A] hover:bg-[#3F3F46] flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-[16px] h-[16px] text-[#A1A1AA]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowModal(false)}>
          <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 w-full max-w-[600px] space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[24px] font-bold text-white">
              {editingFuncion ? "Editar Función" : "Nueva Función"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Película</label>
                  <select
                    value={formData.pelicula_id}
                    onChange={(e) => setFormData({ ...formData, pelicula_id: e.target.value })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {peliculas.map(p => (
                      <option key={p._id} value={p._id}>{p.titulo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Sala</label>
                  <select
                    value={formData.sala_id}
                    onChange={(e) => setFormData({ ...formData, sala_id: e.target.value })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {dropdownSalas.map(s => (
                      <option key={s._id} value={s._id}>{s.nombre}{!s.activa ? " (inactiva)" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_hora}
                    onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Precio Base</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_base}
                    onChange={(e) => setFormData({ ...formData, precio_base: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Idioma</label>
                  <select
                    value={formData.idioma}
                    onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  >
                    <option value="español">Español</option>
                    <option value="subtitulada">Subtitulado</option>
                    <option value="doblada">Doblada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Formato</label>
                  <select
                    value={formData.formato}
                    onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
                    className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[16px] text-white">
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    className="w-[18px] h-[18px] accent-[#E50914]"
                  />
                  Función activa
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
                  {editingFuncion ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
