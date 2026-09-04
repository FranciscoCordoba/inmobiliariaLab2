import { pgTable, serial, text, integer, doublePrecision } from "drizzle-orm/pg-core";
import { propietariosTable } from "./propietarios.js";
import { tiposInmuebleTable } from "./tipos_inmueble.js";

export const inmueblesTable = pgTable("inmuebles", {
    id: serial().primaryKey(),
    id_propietario: integer("id_propietario").notNull().references(() => propietariosTable.id),
    img_portada: text("img_portada"),
    direccion: text("direccion").notNull(),
    cupo: integer("cupo").notNull(),
    coordenadas: text("coordenadas"),
    precio_dia: doublePrecision("precio_dia").notNull(),
    porcentaje_reservar: doublePrecision("porcentaje_reservar").notNull().default(20),
    estado: text("estado").notNull().default("Disponible"),
    id_tipo: integer("id_tipo").notNull().references(() => tiposInmuebleTable.id),
});
