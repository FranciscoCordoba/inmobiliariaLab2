import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { inquilinosTable } from "../db/schemas/inquilinos.js";

export type InquilinoInsert = typeof inquilinosTable.$inferInsert;
export type InquilinoSelect = typeof inquilinosTable.$inferSelect;

export class InquilinosModel {
    static async getAll() {
        const inquilinos = await db.select().from(inquilinosTable).orderBy(inquilinosTable.id);
        return inquilinos;
    }

    static async getById(id: number) {
        const [inquilino] = await db.select().from(inquilinosTable).where(eq(inquilinosTable.id, id));
        return inquilino || null;
    }

    static async create(data: Omit<InquilinoInsert, 'id'>) {
        const [nuevo] = await db.insert(inquilinosTable).values(data).returning();
        return nuevo;
    }

    static async update(id: number, data: Partial<Omit<InquilinoInsert, 'id'>>) {
        const [actualizado] = await db.update(inquilinosTable).set(data).where(eq(inquilinosTable.id, id)).returning();
        return actualizado || null;
    }

    static async delete(id: number) {
        const [eliminado] = await db.delete(inquilinosTable).where(eq(inquilinosTable.id, id)).returning();
        return eliminado || null;
    }
}