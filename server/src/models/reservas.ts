import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { reservasTable } from "../db/schemas/reservas.js";
import { inquilinosTable } from "../db/schemas/inquilinos.js";
import { inmueblesTable } from "../db/schemas/inmuebles.js";
import { tiposInmuebleTable } from "../db/schemas/tipos_inmueble.js";
import { propietariosTable } from "../db/schemas/propietarios.js";

export type ReservaInsert = typeof reservasTable.$inferInsert;
export type ReservaSelect = typeof reservasTable.$inferSelect;

export class ReservasModel {
    static async getAll() {
        const rows = await db
            .select({
                id: reservasTable.id,
                id_inquilino: reservasTable.id_inquilino,
                id_inmueble: reservasTable.id_inmueble,
                fecha_inicio: reservasTable.fecha_inicio,
                fecha_fin: reservasTable.fecha_fin,
                fecha_cancelacion: reservasTable.fecha_cancelacion,
                id_usuario_creador: reservasTable.id_usuario_creador,
                id_usuario_cancelador: reservasTable.id_usuario_cancelador,
                inquilino_nombre: inquilinosTable.nombre,
                inquilino_apellido: inquilinosTable.apellido,
                inquilino_dni: inquilinosTable.dni,
                inquilino_telefono: inquilinosTable.telefono,
                inquilino_email: inquilinosTable.email,
                inmueble_direccion: inmueblesTable.direccion,
                inmueble_precio_dia: inmueblesTable.precio_dia,
                inmueble_cupo: inmueblesTable.cupo,
                inmueble_img_portada: inmueblesTable.img_portada,
                tipo_nombre: tiposInmuebleTable.tipo,
                propietario_nombre: propietariosTable.nombre,
                propietario_apellido: propietariosTable.apellido,
            })
            .from(reservasTable)
            .leftJoin(inquilinosTable, eq(reservasTable.id_inquilino, inquilinosTable.id))
            .leftJoin(inmueblesTable, eq(reservasTable.id_inmueble, inmueblesTable.id))
            .leftJoin(tiposInmuebleTable, eq(inmueblesTable.id_tipo, tiposInmuebleTable.id))
            .leftJoin(propietariosTable, eq(inmueblesTable.id_propietario, propietariosTable.id))
            .orderBy(reservasTable.id);

        return rows;
    }

    static async getById(id: number) {
        const [reserva] = await db
            .select({
                id: reservasTable.id,
                id_inquilino: reservasTable.id_inquilino,
                id_inmueble: reservasTable.id_inmueble,
                fecha_inicio: reservasTable.fecha_inicio,
                fecha_fin: reservasTable.fecha_fin,
                fecha_cancelacion: reservasTable.fecha_cancelacion,
                id_usuario_creador: reservasTable.id_usuario_creador,
                id_usuario_cancelador: reservasTable.id_usuario_cancelador,
                inquilino_nombre: inquilinosTable.nombre,
                inquilino_apellido: inquilinosTable.apellido,
                inquilino_dni: inquilinosTable.dni,
                inquilino_telefono: inquilinosTable.telefono,
                inquilino_email: inquilinosTable.email,
                inmueble_direccion: inmueblesTable.direccion,
                inmueble_precio_dia: inmueblesTable.precio_dia,
                inmueble_cupo: inmueblesTable.cupo,
                inmueble_img_portada: inmueblesTable.img_portada,
                tipo_nombre: tiposInmuebleTable.tipo,
                propietario_nombre: propietariosTable.nombre,
                propietario_apellido: propietariosTable.apellido,
                propietario_telefono: propietariosTable.telefono,
            })
            .from(reservasTable)
            .leftJoin(inquilinosTable, eq(reservasTable.id_inquilino, inquilinosTable.id))
            .leftJoin(inmueblesTable, eq(reservasTable.id_inmueble, inmueblesTable.id))
            .leftJoin(tiposInmuebleTable, eq(inmueblesTable.id_tipo, tiposInmuebleTable.id))
            .leftJoin(propietariosTable, eq(inmueblesTable.id_propietario, propietariosTable.id))
            .where(eq(reservasTable.id, id));

        return reserva || null;
    }

    static async create(data: Omit<ReservaInsert, "id">) {
        const [nueva] = await db.insert(reservasTable).values(data).returning();
        return await this.getById(nueva.id);
    }

    static async update(id: number, data: Partial<Omit<ReservaInsert, "id">>) {
        const [actualizada] = await db
            .update(reservasTable)
            .set(data)
            .where(eq(reservasTable.id, id))
            .returning();

        if (!actualizada) return null;
        return await this.getById(id);
    }

    static async delete(id: number) {
        const [eliminada] = await db.delete(reservasTable).where(eq(reservasTable.id, id)).returning();
        return eliminada || null;
    }
}
