import { db } from "../db/index.js";
import { inquilinosTable } from "../db/schemas/inquilinos.js";

export class InquilinosModel {
    static async getAll() {
        const inquilinos = await db.select().from(inquilinosTable)
        return inquilinos
    }
}