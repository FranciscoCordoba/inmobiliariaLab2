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
  Users,
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Tag,
} from "lucide-react";

import type { Inmueble, Propietario, TipoInmueble } from "../types";

const API_INMUEBLES = "http://localhost:5000/inmuebles";
const API_PROPIETARIOS = "http://localhost:5000/propietarios";
const API_TIPOS = "http://localhost:5000/tipos-inmueble";

const initialFormData: Inmueble = {
  id_propietario: "",
  id_tipo: "",
  direccion: "",
  cupo: "",
  coordenadas: "",
  precio_dia: "",
  porcentaje_reservar: 20,
  estado: "Disponible",
  img_portada: "",
};

export function Inmuebles() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [tipos, setTipos] = useState<TipoInmueble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentInmueble, setCurrentInmueble] = useState<Inmueble>(initialFormData);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inmuebleToDelete, setInmuebleToDelete] = useState<Inmueble | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resInm, resProp, resTipos] = await Promise.all([
        fetch(API_INMUEBLES),
        fetch(API_PROPIETARIOS),
        fetch(API_TIPOS),
      ]);

      if (resInm.ok) setInmuebles(await resInm.json());
      if (resProp.ok) setPropietarios(await resProp.json());
      if (resTipos.ok) setTipos(await resTipos.json());
    } catch {
      showAlert("error", "Error al cargar datos desde el servidor.");
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

  const handleOpenCreateModal = () => {
    setCurrentInmueble(initialFormData);
    setExtraImages([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (item: Inmueble) => {
    try {
      const res = await fetch(`${API_INMUEBLES}/${item.id}`);
      if (res.ok) {
        const fullData: Inmueble = await res.json();
        setCurrentInmueble(fullData);
        setExtraImages(fullData.imagenes?.map((img) => img.url) || []);
      } else {
        setCurrentInmueble(item);
        setExtraImages([]);
      }
    } catch {
      setCurrentInmueble(item);
      setExtraImages([]);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDetailsModal = async (item: Inmueble) => {
    try {
      const res = await fetch(`${API_INMUEBLES}/${item.id}`);
      if (res.ok) {
        const fullData: Inmueble = await res.json();
        setSelectedInmueble(fullData);
      } else {
        setSelectedInmueble(item);
      }
    } catch {
      setSelectedInmueble(item);
    }
    setActiveImageIndex(0);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Inmueble) => {
    setInmuebleToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddImageField = () => {
    setExtraImages([...extraImages, ""]);
  };

  const handleImageChange = (index: number, val: string) => {
    const next = [...extraImages];
    next[index] = val;
    setExtraImages(next);
  };

  const handleRemoveImageField = (index: number) => {
    setExtraImages(extraImages.filter((_, idx) => idx !== index));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!currentInmueble.id_propietario) errors.id_propietario = "Seleccione un propietario";
    if (!currentInmueble.id_tipo) errors.id_tipo = "Seleccione un tipo de inmueble";
    if (!currentInmueble.direccion.trim()) errors.direccion = "La dirección es obligatoria";
    if (!currentInmueble.cupo || Number(currentInmueble.cupo) <= 0) {
      errors.cupo = "Ingrese un cupo válido (> 0)";
    }
    if (!currentInmueble.precio_dia || Number(currentInmueble.precio_dia) <= 0) {
      errors.precio_dia = "Ingrese un precio por día válido";
    }
    if (
      currentInmueble.porcentaje_reservar === "" ||
      Number(currentInmueble.porcentaje_reservar) < 0 ||
      Number(currentInmueble.porcentaje_reservar) > 100
    ) {
      errors.porcentaje_reservar = "El porcentaje debe estar entre 0 y 100";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const isEdit = Boolean(currentInmueble.id);
    const url = isEdit ? `${API_INMUEBLES}/${currentInmueble.id}` : API_INMUEBLES;
    const method = isEdit ? "PUT" : "POST";

    const allImages = [
      ...(currentInmueble.img_portada?.trim() ? [currentInmueble.img_portada.trim()] : []),
      ...extraImages.filter((u) => u.trim().length > 0 && u.trim() !== currentInmueble.img_portada?.trim()),
    ];

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentInmueble,
          id_propietario: Number(currentInmueble.id_propietario),
          id_tipo: Number(currentInmueble.id_tipo),
          cupo: Number(currentInmueble.cupo),
          precio_dia: Number(currentInmueble.precio_dia),
          porcentaje_reservar: Number(currentInmueble.porcentaje_reservar),
          img_portada: currentInmueble.img_portada?.trim() || (allImages[0] || null),
          imagenes: allImages,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error al guardar el inmueble");
      }

      await fetchData();
      setIsModalOpen(false);
      showAlert("success", isEdit ? "Inmueble actualizado exitosamente" : "Inmueble creado exitosamente");
    } catch (err: any) {
      showAlert("error", err.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!inmuebleToDelete?.id) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_INMUEBLES}/${inmuebleToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al eliminar el inmueble");
      }

      await fetchData();
      setIsDeleteModalOpen(false);
      showAlert("success", "Inmueble eliminado con éxito");
    } catch (err: any) {
      showAlert("error", err.message || "Error al eliminar el inmueble");
    } finally {
      setIsSubmitting(false);
      setInmuebleToDelete(null);
    }
  };

  const filteredInmuebles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inmuebles.filter((inm) => {
      const matchText =
        inm.direccion.toLowerCase().includes(term) ||
        (inm.tipo_nombre && inm.tipo_nombre.toLowerCase().includes(term)) ||
        (inm.propietario_nombre && inm.propietario_nombre.toLowerCase().includes(term)) ||
        (inm.propietario_apellido && inm.propietario_apellido.toLowerCase().includes(term)) ||
        inm.id?.toString().includes(term);

      const matchTipo = filterTipo === "all" || inm.id_tipo.toString() === filterTipo;
      const matchEstado = filterEstado === "all" || inm.estado === filterEstado;

      return matchText && matchTipo && matchEstado;
    });
  }, [inmuebles, searchTerm, filterTipo, filterEstado]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Disponible":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Ocupado":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Mantenimiento":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

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
            <span>Gestión de Inmuebles</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Control de propiedades, precios, cupos, fotos y estado de disponibilidad.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Inmueble</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por dirección, propietario, tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tipo}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="No disponible">No disponible</option>
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-full lg:w-auto text-center">
          Inmuebles: <span className="font-bold text-slate-700">{filteredInmuebles.length}</span>
        </div>
      </div>

      {/* Tabla de Inmuebles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">ID</th>
                <th className="py-3.5 px-4 w-20">Foto</th>
                <th className="py-3.5 px-4">Dirección</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Propietario</th>
                <th className="py-3.5 px-4 text-center">Cupo</th>
                <th className="py-3.5 px-4">Precio / Día</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando inmuebles...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInmuebles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">No se encontraron inmuebles</p>
                    <p className="text-xs mt-1">
                      {searchTerm ? "Prueba cambiando los filtros de búsqueda" : "Crea tu primer inmueble con el botón superior"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInmuebles.map((inm) => (
                  <tr key={inm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400 font-bold">
                      #{inm.id}
                    </td>
                    <td className="py-3.5 px-4">
                      {inm.img_portada ? (
                        <img
                          src={inm.img_portada}
                          alt={inm.direccion}
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{inm.direccion}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {inm.tipo_nombre || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{inm.propietario_nombre} {inm.propietario_apellido}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {inm.cupo} pers.
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      ${Number(inm.precio_dia).toLocaleString("es-AR")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          inm.estado
                        )}`}
                      >
                        {inm.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetailsModal(inm)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inm)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar inmueble"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(inm)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar inmueble"
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

      {/* MODAL VISTA DE DETALLES */}
      {isDetailsModalOpen && selectedInmueble && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedInmueble.direccion}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-slate-400">ID #{selectedInmueble.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(selectedInmueble.estado)}`}>
                      {selectedInmueble.estado}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {selectedInmueble.tipo_nombre}
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

            {/* Galería de Fotos */}
            {selectedInmueble.imagenes && selectedInmueble.imagenes.length > 0 ? (
              <div className="mb-6 space-y-2">
                <div className="relative h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedInmueble.imagenes[activeImageIndex]?.url || selectedInmueble.img_portada || ""}
                    alt="Foto del Inmueble"
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedInmueble.imagenes.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedInmueble.imagenes.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedInmueble.img_portada ? (
              <div className="mb-6 h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img src={selectedInmueble.img_portada} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}

            {/* Grid de Información Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Precio por Día</span>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  ${Number(selectedInmueble.precio_dia).toLocaleString("es-AR")}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Capacidad / Cupo</span>
                <p className="text-lg font-bold text-slate-900">
                  {selectedInmueble.cupo} personas
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Seña para Reservar</span>
                <p className="text-lg font-bold text-indigo-700">
                  {selectedInmueble.porcentaje_reservar}%
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    (${((Number(selectedInmueble.precio_dia) * Number(selectedInmueble.porcentaje_reservar)) / 100).toLocaleString("es-AR")})
                  </span>
                </p>
              </div>
            </div>

            {/* Ficha del Propietario */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Datos del Propietario
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Nombre completo</span>
                  <p className="font-semibold text-slate-800">
                    {selectedInmueble.propietario_nombre} {selectedInmueble.propietario_apellido}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">DNI</span>
                  <p className="font-medium text-slate-700 font-mono">
                    {selectedInmueble.propietario_dni?.toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Teléfono</span>
                  <p className="font-medium text-slate-700">{selectedInmueble.propietario_telefono || "No registrado"}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Correo electrónico</span>
                  <p className="font-medium text-slate-700">{selectedInmueble.propietario_email || "No registrado"}</p>
                </div>
              </div>
            </div>

            {/* Coordenadas / Mapa */}
            {selectedInmueble.coordenadas && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block mb-0.5">Coordenadas GPS</span>
                  <span className="text-xs font-mono text-slate-700">{selectedInmueble.coordenadas}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedInmueble.coordenadas)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Maps</span>
                </a>
              </div>
            )}

            {/* Botón Cerrar */}
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

      {/* MODAL ALTA / MODIFICACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {currentInmueble.id ? "Editar Inmueble" : "Nuevo Inmueble"}
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
                    Propietario *
                  </label>
                  <select
                    value={currentInmueble.id_propietario}
                    onChange={(e) =>
                      setCurrentInmueble({ ...currentInmueble, id_propietario: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.id_propietario ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Seleccionar propietario...</option>
                    {propietarios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido} (DNI: {p.dni})
                      </option>
                    ))}
                  </select>
                  {formErrors.id_propietario && <p className="text-xs text-rose-500 mt-1">{formErrors.id_propietario}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Tipo de Inmueble *
                  </label>
                  <select
                    value={currentInmueble.id_tipo}
                    onChange={(e) =>
                      setCurrentInmueble({ ...currentInmueble, id_tipo: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.id_tipo ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_tipo && <p className="text-xs text-rose-500 mt-1">{formErrors.id_tipo}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={currentInmueble.direccion}
                  onChange={(e) => setCurrentInmueble({ ...currentInmueble, direccion: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    formErrors.direccion ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder="Ej. Av. Illia 450, San Luis"
                />
                {formErrors.direccion && <p className="text-xs text-rose-500 mt-1">{formErrors.direccion}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Cupo (personas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentInmueble.cupo}
                    onChange={(e) =>
                      setCurrentInmueble({ ...currentInmueble, cupo: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.cupo ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 4"
                  />
                  {formErrors.cupo && <p className="text-xs text-rose-500 mt-1">{formErrors.cupo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Precio por Día ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentInmueble.precio_dia}
                    onChange={(e) =>
                      setCurrentInmueble({ ...currentInmueble, precio_dia: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      formErrors.precio_dia ? "border-rose-400 focus:ring-rose-400" : "border-slate-200 focus:ring-indigo-500"
                    }`}
                    placeholder="Ej. 45000"
                  />
                  {formErrors.precio_dia && <p className="text-xs text-rose-500 mt-1">{formErrors.precio_dia}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    % Seña Reserva
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentInmueble.porcentaje_reservar}
                    onChange={(e) =>
                      setCurrentInmueble({ ...currentInmueble, porcentaje_reservar: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ej. 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Estado
                  </label>
                  <select
                    value={currentInmueble.estado}
                    onChange={(e) => setCurrentInmueble({ ...currentInmueble, estado: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="No disponible">No disponible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Coordenadas GPS (Opcional)
                  </label>
                  <input
                    type="text"
                    value={currentInmueble.coordenadas || ""}
                    onChange={(e) => setCurrentInmueble({ ...currentInmueble, coordenadas: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Ej. -33.295014, -66.335633"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  URL Imagen de Portada
                </label>
                <input
                  type="url"
                  value={currentInmueble.img_portada || ""}
                  onChange={(e) => setCurrentInmueble({ ...currentInmueble, img_portada: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="https://ejemplo.com/foto-inmueble.jpg"
                />
              </div>

              {/* Imágenes Adicionales */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Imágenes Adicionales de la Galería
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Foto</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {extraImages.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder={`URL Imagen #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  <span>{currentInmueble.id ? "Guardar Cambios" : "Crear Inmueble"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && inmuebleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Eliminar Inmueble</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar el inmueble ubicado en{" "}
              <strong className="text-slate-900">{inmuebleToDelete.direccion}</strong>? Esta acción borrará también las imágenes asociadas.
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
