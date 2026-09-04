import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const tiposInmuebleTable = pgTable("tipos_inmueble", {
    id: serial().primaryKey(),
    tipo: text().notNull(),
    descripcion: text().notNull(),
});
