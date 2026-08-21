import type { Request, Response } from "express";
import { PropietariosModel } from "../models/propietarios.js";

export class PropietariosController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const propietarios = await PropietariosModel.getAll();
            res.json(propietarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener los propietarios' });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const propietario = await PropietariosModel.getById(id);
            if (!propietario) {
                return res.status(404).json({ error: 'Propietario no encontrado' });
            }
            res.json(propietario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el propietario' });
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

            const nuevoPropietario = await PropietariosModel.create({
                nombre: String(nombre).trim(),
                apellido: String(apellido).trim(),
                dni: parsedDni,
                telefono: String(telefono).trim(),
                email: String(email).trim()
            });

            res.status(201).json(nuevoPropietario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el propietario' });
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

            const propietarioActualizado = await PropietariosModel.update(id, dataToUpdate);
            if (!propietarioActualizado) {
                return res.status(404).json({ error: 'Propietario no encontrado' });
            }

            res.json(propietarioActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el propietario' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const propietarioEliminado = await PropietariosModel.delete(id);
            if (!propietarioEliminado) {
                return res.status(404).json({ error: 'Propietario no encontrado' });
            }

            res.json({ message: 'Propietario eliminado correctamente', data: propietarioEliminado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el propietario' });
        }
    };
}