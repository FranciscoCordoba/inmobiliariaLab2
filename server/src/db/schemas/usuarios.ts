import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const usuariosTable = pgTable("usuarios", {
    id: serial().primaryKey(),
    email: text("email").notNull().unique(),
    contrasena: text("contrasena").notNull(),
    rol: text("rol").notNull().default("empleado"),
});
