import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, CheckCircle2, Eye, Tag } from "lucide-react";
import type { TipoInmueble } from "../types";


const API_URL = "http://localhost:5000/tipos-inmueble";

const initialFormData: TipoInmueble = {
  tipo: "",
  descripcion: "",
};

export function TiposInmueble() {
  const [tipos, setTipos] = useState<Required<TipoInmueble>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTipo, setCurrentTipo] = useState<TipoInmueble>(initialFormData);
  const [selectedTipo, setSelectedTipo] = useState<Required<TipoInmueble> | null>(null);
  const [tipoToDelete, setTipoToDelete] = useState<Required<TipoInmueble> | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TipoInmueble, string>>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTipos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener los tipos de inmueble");
      const data = await response.json();
      setTipos(data);
    } catch (err) {
      showAlert("error", "No se pudo conectar con el servidor para cargar los tipos de inmueble.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCurrentTipo(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Required<TipoInmueble>) => {
    setCurrentTipo(item);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDetailsModal = async (item: Required<TipoInmueble>) => {
    try {
      const response = await fetch(`${API_URL}/${item.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTipo(data);
      } else {
        setSelectedTipo(item);
      }
    } catch {
      setSelectedTipo(item);
    }
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Required<TipoInmueble>) => {
    setTipoToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof TipoInmueble, string>> = {};
    if (!currentTipo.tipo.trim()) errors.tipo = "El tipo es obligatorio (ej. Casa, Departamento)";
    if (!currentTipo.descripcion.trim()) errors.descripcion = "La descripción es obligatoria";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const isEdit = Boolean(currentTipo.id);
    const url = isEdit ? `${API_URL}/${currentTipo.id}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTipo),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ocurrió un error al guardar el tipo de inmueble");
      }

      await fetchTipos();
      setIsModalOpen(false);
      showAlert("success", isEdit ? "Tipo de inmueble actualizado con éxito" : "Tipo de inmueble creado con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tipoToDelete?.id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/${tipoToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar el tipo de inmueble");
      }

      await fetchTipos();
      setIsDeleteModalOpen(false);
      showAlert("success", "Tipo de inmueble eliminado correctamente");
    } catch (err: any) {
      showAlert("error", err.message || "Error al eliminar el tipo de inmueble");
    } finally {
      setIsSubmitting(false);
      setTipoToDelete(null);
    }
  };

  const filteredTipos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return tipos.filter(
      (t) =>
        t.tipo.toLowerCase().includes(term) ||
        t.descripcion.toLowerCase().includes(term) ||
        t.id.toString().includes(term)
    );
  }, [tipos, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Alerta */}
      {alert && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium shadow-xs transition-all ${alert.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tipos de Inmueble</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Categorías de inmuebles ofrecidos (Casas, Departamentos, Cabañas, Locales, etc.).
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Tipo</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Conteo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por tipo o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
          />
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">
          Total de tipos registrados: <span className="font-bold text-slate-700">{tipos.length}</span>
        </div>
      </div>

      {/* Tabla de Tipos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">ID</th>
                <th className="py-3.5 px-4 w-48">Tipo de Inmueble</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando tipos de inmueble...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTipos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No se encontraron tipos de inmueble</p>
                    <p className="text-xs mt-1">
                      {searchTerm ? "Intenta modificar el término de búsqueda" : "Crea tu primer tipo con el botón superior"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTipos.map((tipo) => (
                  <tr key={tipo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                      #{tipo.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        {tipo.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 line-clamp-2">
                      {tipo.descripcion}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetailsModal(tipo)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(tipo)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar tipo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(tipo)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar tipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalles */}
      {isDetailsModalOpen && selectedTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detalles del Tipo de Inmueble</h3>
                  <span className="text-xs text-slate-400 font-mono">Registro #{selectedTipo.id}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Nombre del Tipo</span>
                <p className="text-base font-bold text-indigo-700">{selectedTipo.tipo}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Descripción</span>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTipo.descripcion}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alta / Modificación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {currentTipo.id ? "Editar Tipo de Inmueble" : "Nuevo Tipo de Inmueble"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Tipo / Nombre de Categoría
                </label>
                <input
                  type="text"
                  value={currentTipo.tipo}
                  onChange={(e) => setCurrentTipo({ ...currentTipo, tipo: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.tipo
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="Ej. Casa, Departamento, Cabaña, Local Comercial..."
                />
                {formErrors.tipo && <p className="text-xs text-rose-500 mt-1">{formErrors.tipo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={currentTipo.descripcion}
                  onChange={(e) => setCurrentTipo({ ...currentTipo, descripcion: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.descripcion
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="Describe las características principales de este tipo de inmueble..."
                />
                {formErrors.descripcion && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.descripcion}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{currentTipo.id ? "Guardar Cambios" : "Crear Tipo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {isDeleteModalOpen && tipoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Eliminar Tipo de Inmueble</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la categoría{" "}
              <strong className="text-slate-900">{tipoToDelete.tipo}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
