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

            const strNombre = String(nombre).trim();
            const strApellido = String(apellido).trim();
            const strTelefono = String(telefono).trim();
            const strEmail = String(email).trim();

            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
            const hasLetterRegex = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/;
            const phoneRegex = /^[0-9+\s\-()]+$/;
            const hasDigitRegex = /[0-9]/;

            if (!hasLetterRegex.test(strNombre) || !nameRegex.test(strNombre)) {
                return res.status(400).json({ error: 'El nombre debe contener letras y no puede ser solo números ni contener caracteres numéricos' });
            }

            if (!hasLetterRegex.test(strApellido) || !nameRegex.test(strApellido)) {
                return res.status(400).json({ error: 'El apellido debe contener letras y no puede ser solo números ni contener caracteres numéricos' });
            }

            const parsedDni = Number(dni);
            if (isNaN(parsedDni) || parsedDni <= 0) {
                return res.status(400).json({ error: 'El DNI debe ser un número válido mayor a cero' });
            }

            if (!hasDigitRegex.test(strTelefono) || !phoneRegex.test(strTelefono)) {
                return res.status(400).json({ error: 'El teléfono debe contener números y no puede contener solo letras' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(strEmail)) {
                return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido' });
            }

            const nuevoInquilino = await InquilinosModel.create({
                nombre: strNombre,
                apellido: strApellido,
                dni: parsedDni,
                telefono: strTelefono,
                email: strEmail
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

            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
            const hasLetterRegex = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/;
            const phoneRegex = /^[0-9+\s\-()]+$/;
            const hasDigitRegex = /[0-9]/;

            if (nombre !== undefined) {
                const strNombre = String(nombre).trim();
                if (!hasLetterRegex.test(strNombre) || !nameRegex.test(strNombre)) {
                    return res.status(400).json({ error: 'El nombre debe contener letras y no puede ser solo números ni contener caracteres numéricos' });
                }
                dataToUpdate.nombre = strNombre;
            }

            if (apellido !== undefined) {
                const strApellido = String(apellido).trim();
                if (!hasLetterRegex.test(strApellido) || !nameRegex.test(strApellido)) {
                    return res.status(400).json({ error: 'El apellido debe contener letras y no puede ser solo números ni contener caracteres numéricos' });
                }
                dataToUpdate.apellido = strApellido;
            }

            if (dni !== undefined) {
                const parsedDni = Number(dni);
                if (isNaN(parsedDni) || parsedDni <= 0) {
                    return res.status(400).json({ error: 'El DNI debe ser un número válido mayor a cero' });
                }
                dataToUpdate.dni = parsedDni;
            }

            if (telefono !== undefined) {
                const strTelefono = String(telefono).trim();
                if (!hasDigitRegex.test(strTelefono) || !phoneRegex.test(strTelefono)) {
                    return res.status(400).json({ error: 'El teléfono debe contener números y no puede contener solo letras' });
                }
                dataToUpdate.telefono = strTelefono;
            }

            if (email !== undefined) {
                const strEmail = String(email).trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(strEmail)) {
                    return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido' });
                }
                dataToUpdate.email = strEmail;
            }

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