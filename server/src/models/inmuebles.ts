import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { inmueblesTable } from "../db/schemas/inmuebles.js";
import { propietariosTable } from "../db/schemas/propietarios.js";
import { tiposInmuebleTable } from "../db/schemas/tipos_inmueble.js";
import { imagenesTable } from "../db/schemas/imagenes.js";

export type InmuebleInsert = typeof inmueblesTable.$inferInsert;
export type InmuebleSelect = typeof inmueblesTable.$inferSelect;

export class InmueblesModel {
    static async getAll() {
        const rows = await db
            .select({
                id: inmueblesTable.id,
                id_propietario: inmueblesTable.id_propietario,
                id_tipo: inmueblesTable.id_tipo,
                direccion: inmueblesTable.direccion,
                cupo: inmueblesTable.cupo,
                coordenadas: inmueblesTable.coordenadas,
                precio_dia: inmueblesTable.precio_dia,
                porcentaje_reservar: inmueblesTable.porcentaje_reservar,
                estado: inmueblesTable.estado,
                img_portada: inmueblesTable.img_portada,
                propietario_nombre: propietariosTable.nombre,
                propietario_apellido: propietariosTable.apellido,
                propietario_dni: propietariosTable.dni,
                propietario_telefono: propietariosTable.telefono,
                propietario_email: propietariosTable.email,
                tipo_nombre: tiposInmuebleTable.tipo,
                tipo_descripcion: tiposInmuebleTable.descripcion,
            })
            .from(inmueblesTable)
            .leftJoin(propietariosTable, eq(inmueblesTable.id_propietario, propietariosTable.id))
            .leftJoin(tiposInmuebleTable, eq(inmueblesTable.id_tipo, tiposInmuebleTable.id))
            .orderBy(inmueblesTable.id);

        return rows;
    }

    static async getById(id: number) {
        const [inmueble] = await db
            .select({
                id: inmueblesTable.id,
                id_propietario: inmueblesTable.id_propietario,
                id_tipo: inmueblesTable.id_tipo,
                direccion: inmueblesTable.direccion,
                cupo: inmueblesTable.cupo,
                coordenadas: inmueblesTable.coordenadas,
                precio_dia: inmueblesTable.precio_dia,
                porcentaje_reservar: inmueblesTable.porcentaje_reservar,
                estado: inmueblesTable.estado,
                img_portada: inmueblesTable.img_portada,
                propietario_nombre: propietariosTable.nombre,
                propietario_apellido: propietariosTable.apellido,
                propietario_dni: propietariosTable.dni,
                propietario_telefono: propietariosTable.telefono,
                propietario_email: propietariosTable.email,
                tipo_nombre: tiposInmuebleTable.tipo,
                tipo_descripcion: tiposInmuebleTable.descripcion,
            })
            .from(inmueblesTable)
            .leftJoin(propietariosTable, eq(inmueblesTable.id_propietario, propietariosTable.id))
            .leftJoin(tiposInmuebleTable, eq(inmueblesTable.id_tipo, tiposInmuebleTable.id))
            .where(eq(inmueblesTable.id, id));

        if (!inmueble) return null;

        const imagenes = await db
            .select()
            .from(imagenesTable)
            .where(eq(imagenesTable.id_inmueble, id));

        return {
            ...inmueble,
            imagenes,
        };
    }

    static async create(data: Omit<InmuebleInsert, "id">, imagenesUrls?: string[]) {
        const [nuevo] = await db.insert(inmueblesTable).values(data).returning();

        if (imagenesUrls && imagenesUrls.length > 0) {
            const imagenesToInsert = imagenesUrls
                .filter((url) => url && url.trim().length > 0)
                .map((url, idx) => ({
                    id_inmueble: nuevo.id,
                    url: url.trim(),
                    es_portada: idx === 0,
                }));

            if (imagenesToInsert.length > 0) {
                await db.insert(imagenesTable).values(imagenesToInsert);
            }
        }

        return await this.getById(nuevo.id);
    }

    static async update(id: number, data: Partial<Omit<InmuebleInsert, "id">>, imagenesUrls?: string[]) {
        const [actualizado] = await db
            .update(inmueblesTable)
            .set(data)
            .where(eq(inmueblesTable.id, id))
            .returning();

        if (!actualizado) return null;

        if (imagenesUrls !== undefined) {
            // Eliminar imágenes previas y re-insertar
            await db.delete(imagenesTable).where(eq(imagenesTable.id_inmueble, id));
            const imagenesToInsert = imagenesUrls
                .filter((url) => url && url.trim().length > 0)
                .map((url, idx) => ({
                    id_inmueble: id,
                    url: url.trim(),
                    es_portada: idx === 0,
                }));

            if (imagenesToInsert.length > 0) {
                await db.insert(imagenesTable).values(imagenesToInsert);
            }
        }

        return await this.getById(id);
    }

    static async delete(id: number) {
        await db.delete(imagenesTable).where(eq(imagenesTable.id_inmueble, id));
        const [eliminado] = await db.delete(inmueblesTable).where(eq(inmueblesTable.id, id)).returning();
        return eliminado || null;
    }
}
