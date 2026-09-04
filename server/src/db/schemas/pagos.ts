import { pgTable, serial, text, integer, doublePrecision } from "drizzle-orm/pg-core";
import { reservasTable } from "./reservas.js";
import { usuariosTable } from "./usuarios.js";

export const pagosTable = pgTable("pagos", {
    id: serial().primaryKey(),
    id_reserva: integer("id_reserva").notNull().references(() => reservasTable.id),
    tipo: text("tipo").notNull(),
    monto: doublePrecision("monto").notNull(),
    fecha: text("fecha").notNull(),
    estado: text("estado").notNull().default("Pendiente"),
    id_usuario_creador: integer("id_usuario_creador").references(() => usuariosTable.id),
    id_usuario_cancelador: integer("id_usuario_cancelador").references(() => usuariosTable.id),
});
