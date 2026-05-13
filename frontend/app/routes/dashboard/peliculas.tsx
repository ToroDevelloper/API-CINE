import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getPeliculas, type Pelicula } from "../../services/cineService";
import { useAuthStore } from "../../stores/useAuthStore";
import { apiFetch } from "../../services/apiClient";
import { useAppToast } from "../../components/ToastProvider";
import { Modal } from "../../components/ui/Modal";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const defaultForm = {
  titulo: "",
  sinopsis: "",
  duracion_min: 120,
  generos: "",
  idioma: "Inglés",
  clasificacion: "PG-13",
  poster_url: "",
  fecha_estreno: new Date().toISOString().split("T")[0],
};

export default function Peliculas() {
  const navigate = useNavigate();
  const { addToast } = useAppToast();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === "admin";
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPeliculas();
        if (!alive) return;
        setPeliculas(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando películas");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const loadPeliculas = async () => {
    const data = await getPeliculas();
    setPeliculas(data);
  };

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Pelicula) => {
    setForm({
      titulo: p.titulo,
      sinopsis: p.sinopsis || "",
      duracion_min: p.duracion_min,
      generos: (p.generos || []).join(", "),
      idioma: p.idioma || "Inglés",
      clasificacion: p.clasificacion || "PG-13",
      poster_url: p.poster_url || "",
      fecha_estreno: p.fecha_estreno ? p.fecha_estreno.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        generos: form.generos.split(",").map((g) => g.trim()).filter(Boolean),
        fecha_estreno: new Date(form.fecha_estreno).toISOString(),
      };

      if (editingId) {
        await apiFetch<ApiResponse<unknown>>(`/api/peliculas/${editingId}`, {
          method: "PUT",
          json: body,
        });
        addToast({ type: "success", title: "Película actualizada" });
      } else {
        await apiFetch<ApiResponse<unknown>>("/api/peliculas", {
          method: "POST",
          json: body,
        });
        addToast({ type: "success", title: "Película creada" });
      }
      setShowForm(false);
      await loadPeliculas();
    } catch (e) {
      addToast({ type: "error", title: e instanceof Error ? e.message : "Error guardando" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch<ApiResponse<unknown>>(`/api/peliculas/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      addToast({ type: "success", title: "Película desactivada" });
      await loadPeliculas();
    } catch (e) {
      addToast({ type: "error", title: e instanceof Error ? e.message : "Error eliminando" });
    }
  };

  const hasPeliculas = useMemo(() => peliculas.length > 0, [peliculas.length]);

  return (
    <div className="p-6 bg-bg-main min-h-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main transition-colors">Películas</h1>
          <p className="text-text-dim transition-colors">
            {isAdmin ? "Gestiona el catálogo de películas" : "Explora y reserva tus películas favoritas"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Película
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-dim transition-colors">Cargando películas...</p>
      ) : !hasPeliculas ? (
        <p className="text-text-dim transition-colors">No hay películas disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {peliculas.map((p) => (
            <div
              key={p._id}
              className="group bg-bg-card border border-border-base rounded-xl overflow-hidden hover:border-primary-red hover:shadow-[0_8px_30px_rgba(255,0,0,0.15)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="h-[450px] bg-bg-side transition-colors relative overflow-hidden">
                {p.poster_url ? (
                  <img
                    src={p.poster_url}
                    alt={p.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-dim transition-colors">
                    Sin póster
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                      className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded flex items-center justify-center transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(p._id); }}
                      className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-text-main line-clamp-1 transition-colors">{p.titulo}</h2>
                  <span className="text-xs bg-primary-red px-2 py-1 rounded text-white font-semibold">
                    {p.clasificacion}
                  </span>
                </div>

                <p className="text-sm text-text-dim line-clamp-3 transition-colors">{p.sinopsis}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-dim transition-colors">{p.duracion_min} min</span>
                  <button
                    onClick={() => navigate(`/dashboard/reservar?peliculaId=${p._id}`)}
                    className="px-4 py-2 bg-primary-red hover:bg-[#c0000c] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal isOpen={true} onClose={() => setShowForm(false)}>
          <div className="p-6 space-y-4 max-w-lg">
            <h3 className="text-lg font-bold text-text-main">{editingId ? "Editar Película" : "Nueva Película"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Título</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Sinopsis</label>
                <textarea value={form.sinopsis} onChange={(e) => setForm({ ...form, sinopsis: e.target.value })} rows={3}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-dim mb-1">Duración (min)</label>
                  <input type="number" value={form.duracion_min} onChange={(e) => setForm({ ...form, duracion_min: +e.target.value })}
                    className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dim mb-1">Clasificación</label>
                  <select value={form.clasificacion} onChange={(e) => setForm({ ...form, clasificacion: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red">
                    <option>PG-13</option><option>R</option><option>PG</option><option>G</option><option>NC-17</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Géneros (separados por coma)</label>
                <input value={form.generos} onChange={(e) => setForm({ ...form, generos: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Idioma</label>
                <input value={form.idioma} onChange={(e) => setForm({ ...form, idioma: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">URL del Póster</label>
                <input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Fecha de Estreno</label>
                <input type="date" value={form.fecha_estreno} onChange={(e) => setForm({ ...form, fecha_estreno: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-side border border-border-base rounded text-text-main focus:outline-none focus:border-primary-red" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-bg-side border border-border-base text-text-dim hover:text-text-main rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-primary-red hover:bg-[#c0000c] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <Modal isOpen={true} onClose={() => setDeleteId(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text-main">Desactivar Película</h3>
            </div>
            <p className="text-sm text-text-dim">¿Estás seguro de desactivar esta película?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-bg-side border border-border-base text-text-dim hover:text-text-main rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                Sí, Desactivar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
