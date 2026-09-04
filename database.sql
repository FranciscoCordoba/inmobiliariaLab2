-- ===================================================
-- Esquema de Base de Datos - Inmobiliaria Lab II
-- ===================================================

-- 1. Tabla Propietarios
CREATE TABLE IF NOT EXISTS propietarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni INTEGER NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- 2. Tabla Inquilinos
CREATE TABLE IF NOT EXISTS inquilinos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni INTEGER NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- 3. Tabla Tipos de Inmueble
CREATE TABLE IF NOT EXISTS tipos_inmueble (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL
);

-- 4. Tabla Inmuebles
CREATE TABLE IF NOT EXISTS inmuebles (
    id SERIAL PRIMARY KEY,
    id_propietario INTEGER NOT NULL REFERENCES propietarios(id) ON DELETE RESTRICT,
    img_portada TEXT,
    direccion VARCHAR(255) NOT NULL,
    cupo INTEGER NOT NULL DEFAULT 1,
    coordenadas VARCHAR(100),
    precio_dia DOUBLE PRECISION NOT NULL,
    porcentaje_reservar DOUBLE PRECISION NOT NULL DEFAULT 20,
    estado VARCHAR(50) NOT NULL DEFAULT 'Disponible',
    id_tipo INTEGER NOT NULL REFERENCES tipos_inmueble(id) ON DELETE RESTRICT
);

-- 5. Tabla Imágenes de Inmuebles
CREATE TABLE IF NOT EXISTS imagenes (
    id SERIAL PRIMARY KEY,
    id_inmueble INTEGER NOT NULL REFERENCES inmuebles(id) ON DELETE CASCADE,
    es_portada BOOLEAN NOT NULL DEFAULT FALSE,
    url TEXT NOT NULL
);

-- 6. Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado'
);

-- 7. Tabla Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    id_inquilino INTEGER NOT NULL REFERENCES inquilinos(id) ON DELETE RESTRICT,
    id_inmueble INTEGER NOT NULL REFERENCES inmuebles(id) ON DELETE RESTRICT,
    fecha_inicio VARCHAR(20) NOT NULL,
    fecha_fin VARCHAR(20) NOT NULL,
    fecha_cancelacion VARCHAR(20),
    id_usuario_creador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    id_usuario_cancelador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 8. Tabla Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    id_usuario_creador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    id_usuario_cancelador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ===================================================
-- Datos de prueba iniciales (Opcional para pruebas)
-- ===================================================

INSERT INTO tipos_inmueble (tipo, descripcion) VALUES
('Casa', 'Casa de familia amplia con patio y cochera'),
('Departamento', 'Departamento céntrico totalmente equipado'),
('Cabaña', 'Cabaña en zona serrana ideal para vacaciones')
ON CONFLICT DO NOTHING;

INSERT INTO propietarios (nombre, apellido, dni, telefono, email) VALUES
('Carlos', 'Gómez', 28456123, '2664123456', 'carlos.gomez@email.com'),
('Laura', 'Martínez', 31789456, '2664987654', 'laura.martinez@email.com')
ON CONFLICT DO NOTHING;

INSERT INTO inquilinos (nombre, apellido, dni, telefono, email) VALUES
('Martín', 'Rodríguez', 35123789, '2664332211', 'martin.rodriguez@email.com'),
('Sofía', 'López', 39654123, '2664556677', 'sofia.lopez@email.com')
ON CONFLICT DO NOTHING;

INSERT INTO inmuebles (id_propietario, img_portada, direccion, cupo, coordenadas, precio_dia, porcentaje_reservar, estado, id_tipo) VALUES
(1, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7', 'Av. Illia 450, San Luis', 4, '-33.295014,-66.335633', 45000, 20, 'Disponible', 1),
(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'San Martín 820, Piso 3, San Luis', 2, '-33.301254,-66.337891', 30000, 25, 'Disponible', 2)
ON CONFLICT DO NOTHING;

INSERT INTO imagenes (id_inmueble, es_portada, url) VALUES
(1, TRUE, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7'),
(1, FALSE, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
(2, TRUE, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688')
ON CONFLICT DO NOTHING;
