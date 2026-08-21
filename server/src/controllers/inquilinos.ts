import type { Request, Response } from "express";
import { InquilinosModel } from "../models/inquilinos.js";

export class InquilinosController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const inquilinos = await InquilinosModel.getAll();
            res.json(inquilinos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener los inquilinos' });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const inquilino = await InquilinosModel.getById(id);
            if (!inquilino) {
                return res.status(404).json({ error: 'Inquilino no encontrado' });
            }
            res.json(inquilino);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el inquilino' });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const { nombre, apellido, dni, telefono, email } = req.body;
            if (!nombre || !apellido || dni === undefined || !telefono || !email) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            const parsedDni = Number(dni);
            if (isNaN(parsedDni)) {
                return res.status(400).json({ error: 'El DNI debe ser un número' });
            }

            const nuevoInquilino = await InquilinosModel.create({
                nombre: String(nombre).trim(),
                apellido: String(apellido).trim(),
                dni: parsedDni,
                telefono: String(telefono).trim(),
                email: String(email).trim()
            });

            res.status(201).json(nuevoInquilino);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el inquilino' });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const { nombre, apellido, dni, telefono, email } = req.body;
            const dataToUpdate: Record<string, any> = {};

            if (nombre !== undefined) dataToUpdate.nombre = String(nombre).trim();
            if (apellido !== undefined) dataToUpdate.apellido = String(apellido).trim();
            if (dni !== undefined) {
                const parsedDni = Number(dni);
                if (isNaN(parsedDni)) {
                    return res.status(400).json({ error: 'El DNI debe ser un número' });
                }
                dataToUpdate.dni = parsedDni;
            }
            if (telefono !== undefined) dataToUpdate.telefono = String(telefono).trim();
            if (email !== undefined) dataToUpdate.email = String(email).trim();

            const inquilinoActualizado = await InquilinosModel.update(id, dataToUpdate);
            if (!inquilinoActualizado) {
                return res.status(404).json({ error: 'Inquilino no encontrado' });
            }

            res.json(inquilinoActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el inquilino' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const inquilinoEliminado = await InquilinosModel.delete(id);
            if (!inquilinoEliminado) {
                return res.status(404).json({ error: 'Inquilino no encontrado' });
            }

            res.json({ message: 'Inquilino eliminado correctamente', data: inquilinoEliminado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el inquilino' });
        }
    };
}