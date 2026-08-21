import type { Request, Response } from "express";
import { PropietariosModel } from "../models/propietarios.js";


export class PropietariosController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const propietarios = await PropietariosModel.getAll()
            res.json(propietarios)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error al obtener los propietarios' })
        }
    }
}