import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  Home,
  UserCheck,
  Ban,
  CalendarCheck,
  CreditCard,
} from "lucide-react";

import type { Reserva, Inquilino, Inmueble } from "../types";

const API_RESERVAS = "http://localhost:5000/reservas";
const API_INQUILINOS = "http://localhost:5000/inquilinos";
const API_INMUEBLES = "http://localhost:5000/inmuebles";

const initialFormData: Reserva = {
  id_inquilino: "",
  id_inmueble: "",
  fecha_inicio: "",
  fecha_fin: "",
  fecha_cancelacion: "",
};

export function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentReserva, setCurrentReserva] = useState<Reserva>(initialFormData);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [reservaToDelete, setReservaToDelete] = useState<Reserva | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resRes, resInq, resInm] = await Promise.all([
        fetch(API_RESERVAS),
        fetch(API_INQUILINOS),
        fetch(API_INMUEBLES),
      ]);

      if (resRes.ok) setReservas(await resRes.json());
      if (resInq.ok) setInquilinos(await resInq.json());
      if (resInm.ok) setInmuebles(await resInm.json());
    } catch {
      showAlert("error", "Error al cargar las reservas desde el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diffTime = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleOpenCreateModal = () => {
    setCurrentReserva(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (item: Reserva) => {
    try {
      const res = await fetch(`${API_RESERVAS}/${item.id}`);
      if (res.ok) {
        setSelectedReserva(await res.json());
        setCurrentReserva(item);
      } else {
        setCurrentReserva(item);
      }
    } catch {
      setCurrentReserva(item);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDetailsModal = async (item: Reserva) => {
    try {
      const res = await fetch(`${API_RESERVAS}/${item.id}`);
      if (res.ok) {
        setSelectedReserva(await res.json());
      } else {
        setSelectedReserva(item);
      }
    } catch {
      setSelectedReserva(item);
    }
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Reserva) => {
    setReservaToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!currentReserva.id_inquilino) errors.id_inquilino = "Seleccione un inquilino";
    if (!currentReserva.id_inmueble) errors.id_inmueble = "Seleccione un inmueble";
    if (!currentReserva.fecha_inicio) errors.fecha_inicio = "La fecha de inicio es requerida";
    if (!currentReserva.fecha_fin) errors.fecha_fin = "La fecha de fin es requerida";
    if (
      currentReserva.fecha_inicio &&
      currentReserva.fecha_fin &&
      new Date(currentReserva.fecha_inicio) >= new Date(currentReserva.fecha_fin)
    ) {
      errors.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const isEdit = Boolean(currentReserva.id);
    const url = isEdit ? `${API_RESERVAS}/${currentReserva.id}` : API_RESERVAS;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentReserva,
          id_inquilino: Number(currentReserva.id_inquilino),
          id_inmueble: Number(currentReserva.id_inmueble),
          fecha_cancelacion: currentReserva.fecha_cancelacion?.trim() || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error al procesar la reserva");
      }

      await fetchData();
      setIsModalOpen(false);
      showAlert("success", isEdit ? "Reserva actualizada con éxito" : "Reserva creada con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reservaToDelete?.id) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_RESERVAS}/${reservaToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al eliminar la reserva");
      }

      await fetchData();
      setIsDeleteModalOpen(false);
      showAlert("success", "Reserva eliminada con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al eliminar la reserva");
    } finally {
      setIsSubmitting(false);
      setReservaToDelete(null);
    }
  };

  const getReservaState = (reserva: Reserva) => {
    if (reserva.fecha_cancelacion) {
      return { label: "Cancelada", style: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    const today = new Date().toISOString().split("T")[0];
    if (reserva.fecha_fin < today) {
      return { label: "Finalizada", style: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    if (reserva.fecha_inicio <= today && reserva.fecha_fin >= today) {
      return { label: "En Curso", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    return { label: "Confirmada", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  };

  const filteredReservas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return reservas.filter((res) => {
      const matchText =
        (res.inquilino_nombre && res.inquilino_nombre.toLowerCase().includes(term)) ||
        (res.inquilino_apellido && res.inquilino_apellido.toLowerCase().includes(term)) ||
        (res.inmueble_direccion && res.inmueble_direccion.toLowerCase().includes(term)) ||
        res.id?.toString().includes(term);

      const stateInfo = getReservaState(res);
      const matchStatus = filterStatus === "all" || stateInfo.label.toLowerCase() === filterStatus.toLowerCase();

      return matchText && matchStatus;
    });
  }, [reservas, searchTerm, filterStatus]);

  // Selected Inmueble for live preview in Create form
  const currentInmuebleData = useMemo(() => {
    if (!currentReserva.id_inmueble) return null;
    return inmuebles.find((i) => i.id === Number(currentReserva.id_inmueble)) || null;
  }, [currentReserva.id_inmueble, inmuebles]);

  const daysCount = calculateDays(currentReserva.fecha_inicio, currentReserva.fecha_fin);
  const estimatedTotal = currentInmuebleData && currentInmuebleData.precio_dia
    ? daysCount * Number(currentInmuebleData.precio_dia)
    : 0;

  return (
    <div className="space-y-6">
      {/* Alerta */}
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

      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Gestión de Reservas</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra reservas de inmuebles, inquilinos, fechas de estancia y cancelaciones.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por inquilino, inmueble..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmada">Confirmada</option>
            <option value="en curso">En Curso</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">
          Total reservas: <span className="font-bold text-slate-700">{filteredReservas.length}</span>
        </div>
      </div>

      {/* Tabla de Reservas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">ID</th>
                <th className="py-3.5 px-4">Inquilino</th>
                <th className="py-3.5 px-4">Inmueble</th>
                <th className="py-3.5 px-4">Fecha Inicio</th>
                <th className="py-3.5 px-4">Fecha Fin</th>
                <th className="py-3.5 px-4 text-center">Noches</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando reservas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReservas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No se encontraron reservas</p>
                    <p className="text-xs mt-1">
                      {searchTerm ? "Prueba cambiando los filtros de búsqueda" : "Crea tu primera reserva con el botón superior"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReservas.map((res) => {
                  const stateInfo = getReservaState(res);
                  const nights = calculateDays(res.fecha_inicio, res.fecha_fin);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                        #{res.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{res.inquilino_nombre} {res.inquilino_apellido}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{res.inmueble_direccion}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{res.fecha_inicio}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{res.fecha_fin}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {nights} {nights === 1 ? "noche" : "noches"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${stateInfo.style}`}
                        >
                          {stateInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetailsModal(res)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(res)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar reserva"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(res)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar reserva"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VISTA DE DETALLES */}
      {isDetailsModalOpen && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detalles de la Reserva</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-slate-400">ID #{selectedReserva.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getReservaState(selectedReserva).style}`}>
                      {getReservaState(selectedReserva).label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alerta si está cancelada */}
            {selectedReserva.fecha_cancelacion && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Esta reserva fue cancelada el día <strong>{selectedReserva.fecha_cancelacion}</strong>.
                </span>
              </div>
            )}

            {/* Período y montos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Fecha de Entrada</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{selectedReserva.fecha_inicio}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Fecha de Salida</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{selectedReserva.fecha_fin}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Total Estadía</span>
                <p className="text-sm font-bold text-indigo-700">
                  {calculateDays(selectedReserva.fecha_inicio, selectedReserva.fecha_fin)} noches
                </p>
              </div>
            </div>

            {/* Inquilino e Inmueble Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Inquilino */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Datos del Inquilino</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><span className="text-slate-400">Nombre:</span> <strong>{selectedReserva.inquilino_nombre} {selectedReserva.inquilino_apellido}</strong></p>
                  <p><span className="text-slate-400">DNI:</span> {selectedReserva.inquilino_dni?.toLocaleString("es-AR")}</p>
                  <p><span className="text-slate-400">Teléfono:</span> {selectedReserva.inquilino_telefono || "No especificado"}</p>
                  <p><span className="text-slate-400">Email:</span> {selectedReserva.inquilino_email || "No especificado"}</p>
                </div>
              </div>

              {/* Inmueble */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-indigo-600" />
                  <span>Datos del Inmueble</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><span className="text-slate-400">Dirección:</span> <strong>{selectedReserva.inmueble_direccion}</strong></p>
                  <p><span className="text-slate-400">Tipo:</span> {selectedReserva.tipo_nombre || "Inmueble"}</p>
                  <p><span className="text-slate-400">Cupo:</span> {selectedReserva.inmueble_cupo} personas</p>
                  <p>
                    <span className="text-slate-400">Precio / día:</span> ${Number(selectedReserva.inmueble_precio_dia || 0).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimación Económica */}
            {selectedReserva.inmueble_precio_dia && (
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-900 block">Total Estimado de Estadía</span>
                    <span className="text-xs text-indigo-600">
                      {calculateDays(selectedReserva.fecha_inicio, selectedReserva.fecha_fin)} noches x ${Number(selectedReserva.inmueble_precio_dia).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
                <span className="text-xl font-bold text-indigo-900 font-mono">
                  ${(calculateDays(selectedReserva.fecha_inicio, selectedReserva.fecha_fin) * Number(selectedReserva.inmueble_precio_dia)).toLocaleString("es-AR")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
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

      {/* MODAL ALTA / EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {currentReserva.id ? "Editar Reserva" : "Nueva Reserva"}
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
                  Inquilino *
                </label>
                <select
                  value={currentReserva.id_inquilino}
                  onChange={(e) =>
                    setCurrentReserva({
                      ...currentReserva,
                      id_inquilino: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.id_inquilino ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Seleccionar inquilino...</option>
                  {inquilinos.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.nombre} {inq.apellido} (DNI: {inq.dni})
                    </option>
                  ))}
                </select>
                {formErrors.id_inquilino && <p className="text-xs text-rose-500 mt-1">{formErrors.id_inquilino}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Inmueble *
                </label>
                <select
                  value={currentReserva.id_inmueble}
                  onChange={(e) =>
                    setCurrentReserva({
                      ...currentReserva,
                      id_inmueble: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.id_inmueble ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Seleccionar inmueble...</option>
                  {inmuebles.map((inm) => (
                    <option key={inm.id} value={inm.id}>
                      {inm.direccion} - {inm.tipo_nombre || "Inmueble"} (${Number(inm.precio_dia).toLocaleString("es-AR")}/día)
                    </option>
                  ))}
                </select>
                {formErrors.id_inmueble && <p className="text-xs text-rose-500 mt-1">{formErrors.id_inmueble}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Fecha de Inicio (Entrada) *
                  </label>
                  <input
                    type="date"
                    value={currentReserva.fecha_inicio}
                    onChange={(e) => setCurrentReserva({ ...currentReserva, fecha_inicio: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.fecha_inicio ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                  {formErrors.fecha_inicio && <p className="text-xs text-rose-500 mt-1">{formErrors.fecha_inicio}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Fecha de Fin (Salida) *
                  </label>
                  <input
                    type="date"
                    value={currentReserva.fecha_fin}
                    onChange={(e) => setCurrentReserva({ ...currentReserva, fecha_fin: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.fecha_fin ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  />
                  {formErrors.fecha_fin && <p className="text-xs text-rose-500 mt-1">{formErrors.fecha_fin}</p>}
                </div>
              </div>

              {/* Fecha de Cancelación (si aplica para edición) */}
              {currentReserva.id && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Fecha de Cancelación (Opcional)
                  </label>
                  <input
                    type="date"
                    value={currentReserva.fecha_cancelacion || ""}
                    onChange={(e) => setCurrentReserva({ ...currentReserva, fecha_cancelacion: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <span className="text-[11px] text-slate-400">Si se completa, la reserva figurará como cancelada.</span>
                </div>
              )}

              {/* Cálculo en vivo */}
              {daysCount > 0 && currentInmuebleData && (
                <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex justify-between items-center">
                  <span>
                    Duración: <strong>{daysCount} noches</strong>
                  </span>
                  <span className="text-sm font-bold font-mono">
                    Total Estimado: ${estimatedTotal.toLocaleString("es-AR")}
                  </span>
                </div>
              )}

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
                  <span>{currentReserva.id ? "Guardar Cambios" : "Crear Reserva"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && reservaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Eliminar Reserva</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la reserva #{reservaToDelete.id} de{" "}
              <strong className="text-slate-900">
                {reservaToDelete.inquilino_nombre} {reservaToDelete.inquilino_apellido}
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
