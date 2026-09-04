export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  dni: number | '';
  telefono: string;
  email: string;
}

export type Propietario = Required<Persona>;
export type Inquilino = Required<Persona>;

export interface TipoInmueble {
  id?: number;
  tipo: string;
  descripcion: string;
}

export interface ImagenInmueble {
  id?: number;
  id_inmueble?: number;
  es_portada: boolean;
  url: string;
}

export interface Inmueble {
  id?: number;
  id_propietario: number | '';
  id_tipo: number | '';
  direccion: string;
  cupo: number | '';
  coordenadas?: string | null;
  precio_dia: number | '';
  porcentaje_reservar: number | '';
  estado: string;
  img_portada?: string | null;
  // Relational details
  propietario_nombre?: string;
  propietario_apellido?: string;
  propietario_dni?: number;
  propietario_telefono?: string;
  propietario_email?: string;
  tipo_nombre?: string;
  tipo_descripcion?: string;
  imagenes?: ImagenInmueble[];
}

export interface Reserva {
  id?: number;
  id_inquilino: number | '';
  id_inmueble: number | '';
  fecha_inicio: string;
  fecha_fin: string;
  fecha_cancelacion?: string | null;
  id_usuario_creador?: number | null;
  id_usuario_cancelador?: number | null;
  // Relational details
  inquilino_nombre?: string;
  inquilino_apellido?: string;
  inquilino_dni?: number;
  inquilino_telefono?: string;
  inquilino_email?: string;
  inmueble_direccion?: string;
  inmueble_precio_dia?: number;
  inmueble_cupo?: number;
  inmueble_img_portada?: string | null;
  tipo_nombre?: string;
  propietario_nombre?: string;
  propietario_apellido?: string;
  propietario_telefono?: string;
}
