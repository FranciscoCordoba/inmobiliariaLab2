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
