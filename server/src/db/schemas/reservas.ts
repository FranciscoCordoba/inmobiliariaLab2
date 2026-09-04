import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { inquilinosTable } from "./inquilinos.js";
import { inmueblesTable } from "./inmuebles.js";
import { usuariosTable } from "./usuarios.js";

export const reservasTable = pgTable("reservas", {
    id: serial().primaryKey(),
    id_inquilino: integer("id_inquilino").notNull().references(() => inquilinosTable.id),
    id_inmueble: integer("id_inmueble").notNull().references(() => inmueblesTable.id),
    fecha_inicio: text("fecha_inicio").notNull(),
    fecha_fin: text("fecha_fin").notNull(),
    fecha_cancelacion: text("fecha_cancelacion"),
    id_usuario_creador: integer("id_usuario_creador").references(() => usuariosTable.id),
    id_usuario_cancelador: integer("id_usuario_cancelador").references(() => usuariosTable.id),
});
