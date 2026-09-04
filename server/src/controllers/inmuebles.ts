import type { Request, Response } from "express";
import { InmueblesModel } from "../models/inmuebles.js";

export class InmueblesController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const inmuebles = await InmueblesModel.getAll();
            res.json(inmuebles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener los inmuebles" });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const inmueble = await InmueblesModel.getById(id);
            if (!inmueble) {
                return res.status(404).json({ error: "Inmueble no encontrado" });
            }
            res.json(inmueble);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener los detalles del inmueble" });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const {
                id_propietario,
                id_tipo,
                direccion,
                cupo,
                coordenadas,
                precio_dia,
                porcentaje_reservar,
                estado,
                img_portada,
                imagenes,
            } = req.body;

            if (!id_propietario || !id_tipo || !direccion || cupo === undefined || precio_dia === undefined) {
                return res.status(400).json({ error: "Propietario, tipo, dirección, cupo y precio por día son obligatorios" });
            }

            const parsedPropietario = Number(id_propietario);
            const parsedTipo = Number(id_tipo);
            const parsedCupo = Number(cupo);
            const parsedPrecio = Number(precio_dia);
            const parsedPorcentaje = porcentaje_reservar !== undefined ? Number(porcentaje_reservar) : 20;

            if (isNaN(parsedPropietario) || isNaN(parsedTipo) || isNaN(parsedCupo) || isNaN(parsedPrecio)) {
                return res.status(400).json({ error: "Los campos numéricos no tienen un formato válido" });
            }

            const nuevoInmueble = await InmueblesModel.create(
                {
                    id_propietario: parsedPropietario,
                    id_tipo: parsedTipo,
                    direccion: String(direccion).trim(),
                    cupo: parsedCupo,
                    coordenadas: coordenadas ? String(coordenadas).trim() : null,
                    precio_dia: parsedPrecio,
                    porcentaje_reservar: isNaN(parsedPorcentaje) ? 20 : parsedPorcentaje,
                    estado: estado ? String(estado).trim() : "Disponible",
                    img_portada: img_portada ? String(img_portada).trim() : (imagenes && imagenes.length > 0 ? imagenes[0] : null),
                },
                Array.isArray(imagenes) ? imagenes : []
            );

            res.status(201).json(nuevoInmueble);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al registrar el inmueble" });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const {
                id_propietario,
                id_tipo,
                direccion,
                cupo,
                coordenadas,
                precio_dia,
                porcentaje_reservar,
                estado,
                img_portada,
                imagenes,
            } = req.body;

            const dataToUpdate: Record<string, any> = {};

            if (id_propietario !== undefined) dataToUpdate.id_propietario = Number(id_propietario);
            if (id_tipo !== undefined) dataToUpdate.id_tipo = Number(id_tipo);
            if (direccion !== undefined) dataToUpdate.direccion = String(direccion).trim();
            if (cupo !== undefined) dataToUpdate.cupo = Number(cupo);
            if (coordenadas !== undefined) dataToUpdate.coordenadas = coordenadas ? String(coordenadas).trim() : null;
            if (precio_dia !== undefined) dataToUpdate.precio_dia = Number(precio_dia);
            if (porcentaje_reservar !== undefined) dataToUpdate.porcentaje_reservar = Number(porcentaje_reservar);
            if (estado !== undefined) dataToUpdate.estado = String(estado).trim();
            if (img_portada !== undefined) dataToUpdate.img_portada = img_portada ? String(img_portada).trim() : null;

            const actualizado = await InmueblesModel.update(
                id,
                dataToUpdate,
                Array.isArray(imagenes) ? imagenes : undefined
            );

            if (!actualizado) {
                return res.status(404).json({ error: "Inmueble no encontrado" });
            }

            res.json(actualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar el inmueble" });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const eliminado = await InmueblesModel.delete(id);
            if (!eliminado) {
                return res.status(404).json({ error: "Inmueble no encontrado" });
            }

            res.json({ message: "Inmueble eliminado correctamente", data: eliminado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar el inmueble (puede tener reservas asociadas)" });
        }
    };
}
