# Proyecto Inmobiliaria - Laboratorio de Programación II

## Integrantes
- Francisco Córdoba

## Diagrama E-R
![Diagrama E-R](./proyectoInmobiliaria.drawio.png)

---

## Requisitos
- Node.js (v18+)
- Docker y Docker Compose (o PostgreSQL instalado localmente)

---

## Paso a paso para levantar el proyecto

### 1. Base de datos (PostgreSQL)

Opción A - Con Docker (recomendado):
Desde la carpeta `server`:
```bash
cd server
docker-compose up -d
```
> Esto levantará PostgreSQL en el puerto `5434` con la base de datos `inmobiliaria_db`.

Opción B - Manual:
Si usás un PostgreSQL local, podés ejecutar el script `database.sql` incluido en la raíz del proyecto para crear las tablas necesarias (`propietarios` e `inquilinos`).

*Nota:* Si necesitás sincronizar el esquema usando Drizzle ORM:
```bash
cd server
npx drizzle-kit push
```

---

### 2. Backend (API Express)

1. Entrar a la carpeta `server` e instalar dependencias (si no se hizo antes):
   ```bash
   cd server
   npm install
   ```
2. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   El backend quedará corriendo en `http://localhost:5000`.

---

### 3. Frontend (React + Vite)

1. Abrir otra terminal, entrar a `client` e instalar dependencias:
   ```bash
   cd client
   npm install
   ```
2. Iniciar la aplicación web:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador: `http://localhost:5173`.

---

## Funcionalidades para probar
- **/propietarios**: ABM completo de propietarios (crear, listar, buscar, editar y eliminar).
- **/inquilinos**: ABM completo de inquilinos (crear, listar, buscar, editar y eliminar).