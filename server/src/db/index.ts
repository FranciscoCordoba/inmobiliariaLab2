import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { propietariosTable } from './schemas/propietarios.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool });

async function main() {
    await db.insert(propietariosTable).values({
        nombre: "Juan",
        apellido: "Perez",
        dni: 12345678,
        telefono: "123456789",
        email: "[EMAIL_ADDRESS]",
    });

    const resultados = await db.select().from(propietariosTable)
    console.log("Propietarios:", resultados)
}

//main()