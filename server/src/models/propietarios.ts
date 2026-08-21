import { db } from "../db/index.js";
import { propietariosTable } from "../db/schemas/propietarios.js";

export class PropietariosModel {
    static async getAll() {
        const propietarios = await db.select().from(propietariosTable)
        return propietarios
    }
}