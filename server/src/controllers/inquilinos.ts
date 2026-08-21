import type { Request, Response } from "express";
import { InquilinosModel } from "../models/inquilinos.js";


export class InquilinosController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const inquilinos = await InquilinosModel.getAll()
            res.json(inquilinos)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Error al obtener los inquilinos' })
        }
    }
}