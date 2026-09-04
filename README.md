# Proyecto Inmobiliaria - Laboratorio de Programación II

## Integrantes
- Francisco Córdoba

## Diagrama E-R
![Diagrama E-R](./proyectoInmobiliaria.drawio.png)

---

## Requisitos
- Node.js (v18 o superior)
- Docker y Docker Compose (o PostgreSQL instalado localmente)

---

## Cómo levantar el proyecto

### 1. Base de datos (PostgreSQL)

**Opción A - Con Docker (recomendado):**
Desde la carpeta `server`:
```bash
cd server
docker-compose up -d
```
> Levanta PostgreSQL en el puerto `5434` con la base de datos `inmobiliaria_db`.

**Opción B - Con el script SQL:**
Si tenés PostgreSQL instalado en tu máquina o querés cargar las tablas manualmente, ejecutá el archivo `database.sql` ubicado en la raíz del proyecto. Crea todas las tablas con sus claves foráneas e incluye datos de prueba iniciales.

*Para sincronizar el esquema usando Drizzle ORM:*
```bash
cd server
npx drizzle-kit push
```

---

### 2. Backend (Servidor Express)

1. Entrar a la carpeta `server` e instalar dependencias (si es la primera vez):
   ```bash
   cd server
   npm install
   ```
2. Iniciar el servidor:
   ```bash
   npm run dev
   ```
   El backend queda escuchando en `http://localhost:5000`.

---

### 3. Frontend (React + Vite + Tailwind)

1. En otra terminal, entrar a la carpeta `client`:
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

## Módulos y funcionalidades implementadas

- **/inmuebles**: ABM completo de propiedades (crear, listar, buscar, filtrar por tipo/estado, editar y eliminar) con galería de fotos, coordenadas GPS y **vista de detalles** completa con ficha del propietario.
- **/tipos-inmueble**: ABM de categorías de inmueble (Casa, Departamento, Cabaña, etc.) con **vista de detalles**.
- **/reservas**: ABM de reservas de estadías con cálculo automático de noches/precio estimado, control de cancelaciones y **vista de detalles**.
- **/propietarios**: ABM y **vista de detalles** de propietarios de inmuebles.
- **/inquilinos**: ABM y **vista de detalles** de inquilinos.