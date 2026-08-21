import 'dotenv/config'
import { defineConfig } from 'drizzle-kit';

try {
    //@ts-ignore
    process.loadEnvFile('.env')
} catch (error) {
    // ignorar
}

export default defineConfig({
    out: '../drizzle',
    schema: './src/db/schemas',
    dialect: 'postgresql',
    dbCredentials: {
        //@ts-ignore
        url: process.env.DATABASE_URL!,
    },
});
