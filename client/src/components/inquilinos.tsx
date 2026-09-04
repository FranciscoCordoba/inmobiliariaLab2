import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, CheckCircle2, Phone, Mail, Eye, User } from "lucide-react";
import type { Persona } from "../types";


const API_URL = "http://localhost:5000/inquilinos";

const initialFormData: Persona = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
};

export function Inquilinos() {
  const [inquilinos, setInquilinos] = useState<Required<Persona>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentInquilino, setCurrentInquilino] = useState<Persona>(initialFormData);
  const [selectedInquilino, setSelectedInquilino] = useState<Required<Persona> | null>(null);
  const [inquilinoToDelete, setInquilinoToDelete] = useState<Required<Persona> | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Persona, string>>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquilinos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener los inquilinos");
      const data = await response.json();
      setInquilinos(data);
    } catch (err) {
      showAlert("error", "No se pudo conectar con el servidor para cargar los inquilinos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquilinos();
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCurrentInquilino(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Required<Persona>) => {
    setCurrentInquilino(item);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDetailsModal = async (item: Required<Persona>) => {
    try {
      const res = await fetch(`${API_URL}/${item.id}`);
      if (res.ok) {
        setSelectedInquilino(await res.json());
      } else {
        setSelectedInquilino(item);
      }
    } catch {
      setSelectedInquilino(item);
    }
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Required<Persona>) => {
    setInquilinoToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof Persona, string>> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    const hasLetterRegex = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/;
    const phoneRegex = /^[0-9+\s\-()]+$/;
    const hasDigitRegex = /[0-9]/;

    const nombre = currentInquilino.nombre.trim();
    if (!nombre) {
      errors.nombre = "El nombre es obligatorio";
    } else if (!hasLetterRegex.test(nombre) || !nameRegex.test(nombre)) {
      errors.nombre = "El nombre debe contener letras y no puede contener números";
    }

    const apellido = currentInquilino.apellido.trim();
    if (!apellido) {
      errors.apellido = "El apellido es obligatorio";
    } else if (!hasLetterRegex.test(apellido) || !nameRegex.test(apellido)) {
      errors.apellido = "El apellido debe contener letras y no puede contener números";
    }

    if (!currentInquilino.dni) {
      errors.dni = "El DNI es obligatorio";
    } else if (isNaN(Number(currentInquilino.dni)) || Number(currentInquilino.dni) <= 0) {
      errors.dni = "Ingrese un número de DNI válido";
    }

    const telefono = currentInquilino.telefono.trim();
    if (!telefono) {
      errors.telefono = "El teléfono es obligatorio";
    } else if (!hasDigitRegex.test(telefono) || !phoneRegex.test(telefono)) {
      errors.telefono = "El teléfono debe contener números y no puede contener solo letras";
    }

    if (!currentInquilino.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentInquilino.email.trim())) {
      errors.email = "Ingrese un correo electrónico válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const isEdit = Boolean(currentInquilino.id);
    const url = isEdit ? `${API_URL}/${currentInquilino.id}` : API_URL;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentInquilino,
          dni: Number(currentInquilino.dni),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Ocurrió un error al guardar el inquilino");
      }

      await fetchInquilinos();
      setIsModalOpen(false);
      showAlert("success", isEdit ? "Inquilino actualizado con éxito" : "Inquilino creado con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!inquilinoToDelete?.id) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/${inquilinoToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar el inquilino");
      }

      await fetchInquilinos();
      setIsDeleteModalOpen(false);
      showAlert("success", "Inquilino eliminado correctamente");
    } catch (err: any) {
      showAlert("error", err.message || "Error al eliminar el inquilino");
    } finally {
      setIsSubmitting(false);
      setInquilinoToDelete(null);
    }
  };

  const filteredInquilinos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inquilinos.filter(
      (i) =>
        i.nombre.toLowerCase().includes(term) ||
        i.apellido.toLowerCase().includes(term) ||
        i.dni.toString().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.telefono.toLowerCase().includes(term)
    );
  }, [inquilinos, searchTerm]);

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
            <span>Gestión de Inquilinos</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra altas, bajas, modificaciones y consultas de inquilinos.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Inquilino</span>
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
          Total inquilinos: <span className="font-bold text-slate-700">{inquilinos.length}</span>
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
                      <span>Cargando inquilinos...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInquilinos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No se encontraron inquilinos</p>
                    <p className="text-xs mt-1">
                      {searchTerm ? "Intenta modificar el término de búsqueda" : "Crea tu primer inquilino con el botón superior"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInquilinos.map((inquilino) => (
                  <tr
                    key={inquilino.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                      #{inquilino.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {inquilino.nombre} {inquilino.apellido}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {inquilino.dni.toLocaleString("es-AR")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {inquilino.telefono}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {inquilino.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetailsModal(inquilino)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inquilino)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar inquilino"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(inquilino)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar inquilino"
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
      {isDetailsModalOpen && selectedInquilino && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detalles del Inquilino</h3>
                  <span className="text-xs text-slate-400 font-mono">Registro #{selectedInquilino.id}</span>
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
                  <p className="font-bold text-slate-900">{selectedInquilino.nombre} {selectedInquilino.apellido}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">DNI</span>
                  <p className="font-mono text-slate-700">{selectedInquilino.dni.toLocaleString("es-AR")}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Teléfono de Contacto</span>
                    <span className="font-medium text-slate-800">{selectedInquilino.telefono}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Correo Electrónico</span>
                    <span className="font-medium text-slate-800">{selectedInquilino.email}</span>
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
                {currentInquilino.id ? "Editar Inquilino" : "Nuevo Inquilino"}
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
                    value={currentInquilino.nombre}
                    onChange={(e) =>
                      setCurrentInquilino({ ...currentInquilino, nombre: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.nombre
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. María"
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
                    value={currentInquilino.apellido}
                    onChange={(e) =>
                      setCurrentInquilino({ ...currentInquilino, apellido: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.apellido
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. Gómez"
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
                    value={currentInquilino.dni}
                    onChange={(e) =>
                      setCurrentInquilino({
                        ...currentInquilino,
                        dni: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.dni
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 38123456"
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
                    value={currentInquilino.telefono}
                    onChange={(e) =>
                      setCurrentInquilino({ ...currentInquilino, telefono: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.telefono
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 2664987654"
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
                  value={currentInquilino.email}
                  onChange={(e) =>
                    setCurrentInquilino({ ...currentInquilino, email: e.target.value })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.email
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="Ej. maria.gomez@email.com"
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
                  <span>{currentInquilino.id ? "Guardar Cambios" : "Crear Inquilino"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {isDeleteModalOpen && inquilinoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Eliminar Inquilino</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong className="text-slate-900">
                {inquilinoToDelete.nombre} {inquilinoToDelete.apellido}
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