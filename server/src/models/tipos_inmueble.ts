import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tiposInmuebleTable } from "../db/schemas/tipos_inmueble.js";

export type TipoInmuebleInsert = typeof tiposInmuebleTable.$inferInsert;
export type TipoInmuebleSelect = typeof tiposInmuebleTable.$inferSelect;

export class TiposInmuebleModel {
    static async getAll() {
        return await db.select().from(tiposInmuebleTable).orderBy(tiposInmuebleTable.id);
    }

    static async getById(id: number) {
        const [tipo] = await db.select().from(tiposInmuebleTable).where(eq(tiposInmuebleTable.id, id));
        return tipo || null;
    }

    static async create(data: Omit<TipoInmuebleInsert, 'id'>) {
        const [nuevo] = await db.insert(tiposInmuebleTable).values(data).returning();
        return nuevo;
    }

    static async update(id: number, data: Partial<Omit<TipoInmuebleInsert, 'id'>>) {
        const [actualizado] = await db.update(tiposInmuebleTable).set(data).where(eq(tiposInmuebleTable.id, id)).returning();
        return actualizado || null;
    }

    static async delete(id: number) {
        const [eliminado] = await db.delete(tiposInmuebleTable).where(eq(tiposInmuebleTable.id, id)).returning();
        return eliminado || null;
    }
}
