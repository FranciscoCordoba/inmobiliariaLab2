import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";
import { inmueblesTable } from "./inmuebles.js";

export const imagenesTable = pgTable("imagenes", {
    id: serial().primaryKey(),
    id_inmueble: integer("id_inmueble").notNull().references(() => inmueblesTable.id, { onDelete: "cascade" }),
    es_portada: boolean("es_portada").notNull().default(false),
    url: text("url").notNull(),
});
