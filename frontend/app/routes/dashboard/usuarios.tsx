import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getUsuarios, updateUsuario, deleteUsuario, type Usuario } from "../../services/usuarioService";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Usuarios() {
  return (
    <ProtectedRoute requireAdmin>
      <UsuariosContent />
    </ProtectedRoute>
  );
}

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ nombre: "", email: "", rol: "cliente" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getUsuarios();
        if (!alive) return;
        setUsuarios(data);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error cargando usuarios");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await updateUsuario(usuario._id, { activo: !usuario.activo });
      setUsuarios(prev => prev.map(u => u._id === usuario._id ? { ...u, activo: !u.activo } : u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error actualizando usuario");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar este usuario?")) return;
    try {
      await deleteUsuario(id);
      setUsuarios(prev => prev.filter(u => u._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando usuario");
    }
  };

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
    } else {
      setEditingUser(null);
      setFormData({ nombre: "", email: "", rol: "cliente" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updated = await updateUsuario(editingUser._id, formData);
        setUsuarios(prev => prev.map(u => u._id === editingUser._id ? updated : u));
      }
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando usuario");
    }
  };

  return (
    <div className="p-6 space-y-[48px]">
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Usuarios
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Gestionar usuarios, roles y estados de acceso al sistema.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-[12px] px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white rounded-[2px] transition-all shadow-[0_0_20px_rgba(229,9,20,0.2)]"
        >
          <Plus className="w-[16px] h-[16px]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.1em]">NEW USER</span>
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
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
        />
      </div>

      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando usuarios...</p>
      ) : filteredUsuarios.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay usuarios disponibles.</p>
      ) : (
        <div className="bg-[#060606] border border-[#585858] rounded-[4px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#585858]">
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Nombre</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Email</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Rol</th>
                <th className="text-left p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Estado</th>
                <th className="text-right p-4 text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario._id} className="border-b border-[#2E1A18] hover:bg-[#0A0A0A] transition-colors">
                  <td className="p-4 text-[16px] text-white">{usuario.nombre} {usuario.apellido || ""}</td>
                  <td className="p-4 text-[16px] text-[#D4D4D4]">{usuario.email}</td>
                  <td className="p-4">
                    <span className="px-[12px] py-[4px] rounded-[12px] text-[12px] font-bold tracking-[0.05em] bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5] uppercase">
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActivo(usuario)}
                      className="flex items-center gap-2"
                    >
                      {usuario.activo ? (
                        <ToggleRight className="w-[24px] h-[24px] text-[#E50914]" />
                      ) : (
                        <ToggleLeft className="w-[24px] h-[24px] text-[#585858]" />
                      )}
                      <span className={`text-[12px] font-bold ${usuario.activo ? "text-white" : "text-[#999999]"}`}>
                        {usuario.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-[8px]">
                      <button
                        onClick={() => openModal(usuario)}
                        className="w-[36px] h-[36px] rounded-[12px] bg-[#90120A] hover:bg-[#E50914] flex items-center justify-center transition-all"
                      >
                        <Edit2 className="w-[16px] h-[16px] text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario._id)}
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
          <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 w-full max-w-[500px] space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[24px] font-bold text-white">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
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
                <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#D4D4D4] tracking-[0.1em] uppercase mb-2">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full px-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white focus:outline-none focus:border-[#AF8782] transition-colors"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="empleado">Empleado</option>
                </select>
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
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
