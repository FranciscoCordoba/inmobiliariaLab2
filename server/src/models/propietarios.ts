import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { propietariosTable } from "../db/schemas/propietarios.js";

export type PropietarioInsert = typeof propietariosTable.$inferInsert;
export type PropietarioSelect = typeof propietariosTable.$inferSelect;

export class PropietariosModel {
    static async getAll() {
        const propietarios = await db.select().from(propietariosTable).orderBy(propietariosTable.id);
        return propietarios;
    }

    static async getById(id: number) {
        const [propietario] = await db.select().from(propietariosTable).where(eq(propietariosTable.id, id));
        return propietario || null;
    }

    static async create(data: Omit<PropietarioInsert, 'id'>) {
        const [nuevo] = await db.insert(propietariosTable).values(data).returning();
        return nuevo;
    }

    static async update(id: number, data: Partial<Omit<PropietarioInsert, 'id'>>) {
        const [actualizado] = await db.update(propietariosTable).set(data).where(eq(propietariosTable.id, id)).returning();
        return actualizado || null;
    }

    static async delete(id: number) {
        const [eliminado] = await db.delete(propietariosTable).where(eq(propietariosTable.id, id)).returning();
        return eliminado || null;
    }
}