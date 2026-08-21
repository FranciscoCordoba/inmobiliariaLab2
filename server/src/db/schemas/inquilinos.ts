import { pgTable } from "drizzle-orm/pg-core/table";
import { text, integer, serial } from "drizzle-orm/pg-core";

export const inquilinosTable = pgTable("inquilinos", {
    id: serial().primaryKey(),
    nombre: text().notNull(),
    apellido: text().notNull(),
    dni: integer().notNull(),
    telefono: text().notNull(),
    email: text().notNull(),
});