import type { Request, Response } from "express";
import { ReservasModel } from "../models/reservas.js";

export class ReservasController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const reservas = await ReservasModel.getAll();
            res.json(reservas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener las reservas" });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const reserva = await ReservasModel.getById(id);
            if (!reserva) {
                return res.status(404).json({ error: "Reserva no encontrada" });
            }
            res.json(reserva);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener los detalles de la reserva" });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const {
                id_inquilino,
                id_inmueble,
                fecha_inicio,
                fecha_fin,
                fecha_cancelacion,
                id_usuario_creador,
                id_usuario_cancelador,
            } = req.body;

            if (!id_inquilino || !id_inmueble || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({ error: "Inquilino, inmueble, fecha de inicio y fin son obligatorios" });
            }

            const parsedInquilino = Number(id_inquilino);
            const parsedInmueble = Number(id_inmueble);

            if (isNaN(parsedInquilino) || isNaN(parsedInmueble)) {
                return res.status(400).json({ error: "ID de inquilino o inmueble no válido" });
            }

            if (new Date(fecha_inicio) > new Date(fecha_fin)) {
                return res.status(400).json({ error: "La fecha de fin debe ser posterior a la fecha de inicio" });
            }

            const nuevaReserva = await ReservasModel.create({
                id_inquilino: parsedInquilino,
                id_inmueble: parsedInmueble,
                fecha_inicio: String(fecha_inicio).trim(),
                fecha_fin: String(fecha_fin).trim(),
                fecha_cancelacion: fecha_cancelacion ? String(fecha_cancelacion).trim() : null,
                id_usuario_creador: id_usuario_creador ? Number(id_usuario_creador) : null,
                id_usuario_cancelador: id_usuario_cancelador ? Number(id_usuario_cancelador) : null,
            });

            res.status(201).json(nuevaReserva);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al crear la reserva" });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const {
                id_inquilino,
                id_inmueble,
                fecha_inicio,
                fecha_fin,
                fecha_cancelacion,
                id_usuario_creador,
                id_usuario_cancelador,
            } = req.body;

            const dataToUpdate: Record<string, any> = {};

            if (id_inquilino !== undefined) dataToUpdate.id_inquilino = Number(id_inquilino);
            if (id_inmueble !== undefined) dataToUpdate.id_inmueble = Number(id_inmueble);
            if (fecha_inicio !== undefined) dataToUpdate.fecha_inicio = String(fecha_inicio).trim();
            if (fecha_fin !== undefined) dataToUpdate.fecha_fin = String(fecha_fin).trim();
            if (fecha_cancelacion !== undefined) dataToUpdate.fecha_cancelacion = fecha_cancelacion ? String(fecha_cancelacion).trim() : null;
            if (id_usuario_creador !== undefined) dataToUpdate.id_usuario_creador = id_usuario_creador ? Number(id_usuario_creador) : null;
            if (id_usuario_cancelador !== undefined) dataToUpdate.id_usuario_cancelador = id_usuario_cancelador ? Number(id_usuario_cancelador) : null;

            if (dataToUpdate.fecha_inicio && dataToUpdate.fecha_fin && new Date(dataToUpdate.fecha_inicio) > new Date(dataToUpdate.fecha_fin)) {
                return res.status(400).json({ error: "La fecha de fin debe ser posterior a la fecha de inicio" });
            }

            const actualizada = await ReservasModel.update(id, dataToUpdate);
            if (!actualizada) {
                return res.status(404).json({ error: "Reserva no encontrada" });
            }

            res.json(actualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar la reserva" });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const eliminada = await ReservasModel.delete(id);
            if (!eliminada) {
                return res.status(404).json({ error: "Reserva no encontrada" });
            }

            res.json({ message: "Reserva eliminada correctamente", data: eliminada });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar la reserva" });
        }
    };
}
