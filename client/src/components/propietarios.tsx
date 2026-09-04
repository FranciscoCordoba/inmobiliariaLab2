import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, CheckCircle2, Phone, Mail, Eye, User } from "lucide-react";
import type { Persona } from "../types";


const API_URL = "http://localhost:5000/propietarios";

const initialFormData: Persona = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
};

export function Propietarios() {
  const [propietarios, setPropietarios] = useState<Required<Persona>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPropietario, setCurrentPropietario] = useState<Persona>(initialFormData);
  const [selectedPropietario, setSelectedPropietario] = useState<Required<Persona> | null>(null);
  const [propietarioToDelete, setPropietarioToDelete] = useState<Required<Persona> | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Persona, string>>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPropietarios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener los propietarios");
      const data = await response.json();
      setPropietarios(data);
    } catch {
      showAlert("error", "No se pudo conectar con el servidor para cargar los propietarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropietarios();
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCurrentPropietario(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Required<Persona>) => {
    setCurrentPropietario(item);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDetailsModal = async (item: Required<Persona>) => {
    try {
      const res = await fetch(`${API_URL}/${item.id}`);
      if (res.ok) {
        setSelectedPropietario(await res.json());
      } else {
        setSelectedPropietario(item);
      }
    } catch {
      setSelectedPropietario(item);
    }
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Required<Persona>) => {
    setPropietarioToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof Persona, string>> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    const hasLetterRegex = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/;
    const phoneRegex = /^[0-9+\s\-()]+$/;
    const hasDigitRegex = /[0-9]/;

    const nombre = currentPropietario.nombre.trim();
    if (!nombre) {
      errors.nombre = "El nombre es obligatorio";
    } else if (!hasLetterRegex.test(nombre) || !nameRegex.test(nombre)) {
      errors.nombre = "El nombre debe contener letras y no puede contener números";
    }

    const apellido = currentPropietario.apellido.trim();
    if (!apellido) {
      errors.apellido = "El apellido es obligatorio";
    } else if (!hasLetterRegex.test(apellido) || !nameRegex.test(apellido)) {
      errors.apellido = "El apellido debe contener letras y no puede contener números";
    }

    if (!currentPropietario.dni) {
      errors.dni = "El DNI es obligatorio";
    } else if (isNaN(Number(currentPropietario.dni)) || Number(currentPropietario.dni) <= 0) {
      errors.dni = "Ingrese un número de DNI válido";
    }

    const telefono = currentPropietario.telefono.trim();
    if (!telefono) {
      errors.telefono = "El teléfono es obligatorio";
    } else if (!hasDigitRegex.test(telefono) || !phoneRegex.test(telefono)) {
      errors.telefono = "El teléfono debe contener números y no puede contener solo letras";
    }

    if (!currentPropietario.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentPropietario.email.trim())) {
      errors.email = "Ingrese un correo electrónico válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const isEdit = Boolean(currentPropietario.id);
    const url = isEdit ? `${API_URL}/${currentPropietario.id}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentPropietario,
          dni: Number(currentPropietario.dni),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ocurrió un error al guardar el propietario");
      }

      await fetchPropietarios();
      setIsModalOpen(false);
      showAlert("success", isEdit ? "Propietario actualizado con éxito" : "Propietario creado con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!propietarioToDelete?.id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/${propietarioToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar el propietario");
      }

      await fetchPropietarios();
      setIsDeleteModalOpen(false);
      showAlert("success", "Propietario eliminado correctamente");
    } catch (err: any) {
      showAlert("error", err.message || "Error al eliminar el propietario");
    } finally {
      setIsSubmitting(false);
      setPropietarioToDelete(null);
    }
  };

  const filteredPropietarios = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return propietarios.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.dni.toString().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.telefono.toLowerCase().includes(term)
    );
  }, [propietarios, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Alerta de notificación */}
      {alert && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium shadow-xs transition-all ${
            alert.type === "success"
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

      {/* Cabecera de Sección */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Gestión de Propietarios</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra altas, bajas, modificaciones y consultas de propietarios de inmuebles.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Propietario</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Estadísticas */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">
          Total propietarios: <span className="font-bold text-slate-700">{propietarios.length}</span>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">ID</th>
                <th className="py-3.5 px-4">Nombre y Apellido</th>
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando propietarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPropietarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No se encontraron propietarios</p>
                    <p className="text-xs mt-1">
                      {searchTerm ? "Intenta modificar el término de búsqueda" : "Crea tu primer propietario con el botón superior"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPropietarios.map((propietario) => (
                  <tr
                    key={propietario.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                      #{propietario.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {propietario.nombre} {propietario.apellido}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {propietario.dni.toLocaleString("es-AR")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {propietario.telefono}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {propietario.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetailsModal(propietario)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(propietario)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar propietario"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(propietario)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar propietario"
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
      {isDetailsModalOpen && selectedPropietario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detalles del Propietario</h3>
                  <span className="text-xs text-slate-400 font-mono">Registro #{selectedPropietario.id}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Nombre Completo</span>
                  <p className="font-bold text-slate-900">{selectedPropietario.nombre} {selectedPropietario.apellido}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">DNI</span>
                  <p className="font-mono text-slate-700">{selectedPropietario.dni.toLocaleString("es-AR")}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Teléfono de Contacto</span>
                    <span className="font-medium text-slate-800">{selectedPropietario.telefono}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Correo Electrónico</span>
                    <span className="font-medium text-slate-800">{selectedPropietario.email}</span>
                  </div>
                </div>
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
                {currentPropietario.id ? "Editar Propietario" : "Nuevo Propietario"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={currentPropietario.nombre}
                    onChange={(e) =>
                      setCurrentPropietario({ ...currentPropietario, nombre: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.nombre
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. Juan"
                  />
                  {formErrors.nombre && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={currentPropietario.apellido}
                    onChange={(e) =>
                      setCurrentPropietario({ ...currentPropietario, apellido: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.apellido
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. Pérez"
                  />
                  {formErrors.apellido && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.apellido}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    DNI
                  </label>
                  <input
                    type="number"
                    value={currentPropietario.dni}
                    onChange={(e) =>
                      setCurrentPropietario({
                        ...currentPropietario,
                        dni: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.dni
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 34567890"
                  />
                  {formErrors.dni && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.dni}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={currentPropietario.telefono}
                    onChange={(e) =>
                      setCurrentPropietario({ ...currentPropietario, telefono: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.telefono
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 2664123456"
                  />
                  {formErrors.telefono && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.telefono}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={currentPropietario.email}
                  onChange={(e) =>
                    setCurrentPropietario({ ...currentPropietario, email: e.target.value })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.email
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="Ej. juan.perez@email.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>
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
                  <span>{currentPropietario.id ? "Guardar Cambios" : "Crear Propietario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {isDeleteModalOpen && propietarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Eliminar Propietario</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong className="text-slate-900">
                {propietarioToDelete.nombre} {propietarioToDelete.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
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