import type { Request, Response } from "express";
import { TiposInmuebleModel } from "../models/tipos_inmueble.js";

export class TiposInmuebleController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const tipos = await TiposInmuebleModel.getAll();
            res.json(tipos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener los tipos de inmueble" });
        }
    };

    static getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const tipo = await TiposInmuebleModel.getById(id);
            if (!tipo) {
                return res.status(404).json({ error: "Tipo de inmueble no encontrado" });
            }
            res.json(tipo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener el tipo de inmueble" });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const { tipo, descripcion } = req.body;
            if (!tipo || !descripcion) {
                return res.status(400).json({ error: "El tipo y la descripción son obligatorios" });
            }

            const nuevoTipo = await TiposInmuebleModel.create({
                tipo: String(tipo).trim(),
                descripcion: String(descripcion).trim(),
            });

            res.status(201).json(nuevoTipo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al crear el tipo de inmueble" });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const { tipo, descripcion } = req.body;
            const dataToUpdate: Record<string, any> = {};

            if (tipo !== undefined) dataToUpdate.tipo = String(tipo).trim();
            if (descripcion !== undefined) dataToUpdate.descripcion = String(descripcion).trim();

            const actualizado = await TiposInmuebleModel.update(id, dataToUpdate);
            if (!actualizado) {
                return res.status(404).json({ error: "Tipo de inmueble no encontrado" });
            }

            res.json(actualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar el tipo de inmueble" });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const eliminado = await TiposInmuebleModel.delete(id);
            if (!eliminado) {
                return res.status(404).json({ error: "Tipo de inmueble no encontrado" });
            }

            res.json({ message: "Tipo de inmueble eliminado correctamente", data: eliminado });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar el tipo de inmueble (puede tener inmuebles asociados)" });
        }
    };
}
