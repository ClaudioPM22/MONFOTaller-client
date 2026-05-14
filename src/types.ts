// src/types.ts

// --- TIPOS DE USUARIO Y ROLES ---
export type UserRole = 'JEFE_TALLER' | 'MECANICO';

export interface User {
  id: number;
  nombre: string;
  codigoOperador: string;
  rol: UserRole;
  createdAt: string;
}

// --- CATÁLOGOS BASE ---
export interface Product {
  id: number;
  name: string;
  quantity: number;
  unitCost: number;
  clientPrice: number;
}

export interface Service {
  id: number;
  name: string;
  basePrice: number;
}

export interface Customer {
  id: number;
  rut: string;
  name: string;
  phone: string;
  domicilio?: string;
  email?: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  customerId: number;
  customerName?: string;
  customerPhone?: string;
}

// --- TIPOS DE LA ORDEN DE TRABAJO (DETALLE Y TALONARIO) ---

export type OrderStatus = 'PENDIENTE' | 'FINALIZADO' | 'ENTREGADO' | 'CANCELADO';

export interface UsedPart {
  id: number;
  cantidad: number;
  producto: string;
  costoAlMomento: number; // Precio unitario al momento de la venta
}

export interface Intervention {
  id: number;
  fecha: string;
  detalles: string;
  mecanico: string; // codigoOperador
  servicio: {
    id: number;
    nombre: string;
    precioBase: number;
  };
  repuestos: UsedPart[];
}

export interface Checklist {
  documentos: boolean;
  radio: boolean;
  encendedor: boolean;
  gomasPiso: boolean;
  extintor: boolean;
  triangulo: boolean;
  botiquin: boolean;
  gata: boolean;
  herramientas: boolean;
  antena: boolean;
  neumaticoRep: boolean;
  tapaRuedas: boolean;
  tapaBencina: boolean;
  espejos: boolean;
  plumillas: boolean;
}

export interface TalonarioData {
  encabezado: {
    numeroOrden: number;
    fechaRecepcion: string;
    fechaEntregaEstimada?: string;
    kilometraje: number;
    estado: OrderStatus;
  };
  datosCliente: {
    nombre: string;
    rut: string;
    domicilio?: string;
    contacto: string;
  };
  datosVehiculo: {
    marca: string;
    modelo: string;
    anio: number;
    patente: string;
    color: string;
  };
  estadoRecepcion: {
    nivelBencina: string;
    checklist: Checklist | null;
  };
  detalles: {
    requerimientosCliente: string;
    observaciones?: string;
  };
  firmas: {
    recibidoPor: string; // codigoOperador
  };
  intervencionesRealizadas: Intervention[];
}