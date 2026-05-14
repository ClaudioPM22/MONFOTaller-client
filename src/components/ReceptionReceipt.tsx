// src/components/ReceptionReceipt.tsx
import { forwardRef } from 'react';
import { Wrench } from 'lucide-react';

interface Props {
  data: any;
}

export const ReceptionReceipt = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  const { encabezado, datosCliente, datosVehiculo, estadoRecepcion, detalles, firmas } = data;
  const fecha = new Date(encabezado.fechaRecepcion).toLocaleDateString('es-CL');
  const hora = new Date(encabezado.fechaRecepcion).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    // Contenedor principal con medidas aproximadas de A4 para impresión
    <div ref={ref} className="bg-white text-black p-10 w-[210mm] min-h-[297mm] mx-auto text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header del Taller */}
      <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-6">
        <div className="flex items-center">
          <Wrench className="w-10 h-10 mr-3 text-black" />
          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase">MONFO</h1>
            <p className="text-xs text-gray-600">Taller Mecánico Automotriz</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase">Acta de Recepción</h2>
          <p className="font-medium text-lg">Orden N°: {encabezado.numeroOrden}</p>
          <p className="text-sm text-gray-600">Fecha: {fecha} - {hora}</p>
        </div>
      </div>

      {/* Datos del Cliente y Vehículo */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border border-black rounded p-4">
          <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Datos del Cliente</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">RUT:</span> {datosCliente.rut}</p>
            <p><span className="font-semibold">Nombre:</span> {datosCliente.nombre}</p>
            <p><span className="font-semibold">Teléfono:</span> {datosCliente.contacto}</p>
            <p><span className="font-semibold">Domicilio:</span> {datosCliente.domicilio || 'N/A'}</p>
          </div>
        </div>

        <div className="border border-black rounded p-4">
          <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Datos del Vehículo</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Patente:</span> <span className="uppercase">{datosVehiculo.patente}</span></p>
            <p><span className="font-semibold">Vehículo:</span> {datosVehiculo.marca} {datosVehiculo.modelo} ({datosVehiculo.anio})</p>
            <p><span className="font-semibold">Color:</span> {datosVehiculo.color}</p>
            <p><span className="font-semibold">Kilometraje:</span> {encabezado.kilometraje.toLocaleString()} km</p>
          </div>
        </div>
      </div>

      {/* Requerimientos del Cliente */}
      <div className="border border-black rounded p-4 mb-6 min-h-[100px]">
        <h3 className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Motivo de Ingreso / Solicitud</h3>
        <p className="text-sm italic">{detalles.requerimientosCliente}</p>
      </div>

      {/* Inventario / Checklist */}
      <div className="border border-black rounded p-4 mb-6">
        <div className="flex justify-between items-end border-b border-black pb-1 mb-3">
          <h3 className="font-bold uppercase text-xs">Inventario y Estado del Vehículo</h3>
          <p className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">Nivel Bencina: {estadoRecepcion.nivelBencina}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-y-2 gap-x-4 mb-4">
          {estadoRecepcion.checklist && Object.entries(estadoRecepcion.checklist).map(([key, value]) => {
             if (typeof value !== 'boolean') return null;
             return (
               <div key={key} className="flex items-center space-x-2 text-xs">
                 <div className={`w-4 h-4 border border-black flex items-center justify-center ${value ? 'bg-black text-white' : 'bg-white'}`}>
                    {value ? 'X' : ''}
                 </div>
                 <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
               </div>
             );
          })}
        </div>

        <div className="mt-4 pt-2 border-t border-dashed border-gray-400">
          <p className="font-semibold text-xs mb-1">Observaciones visuales (Abolladuras, rayas, etc):</p>
          <p className="text-xs">{detalles.observaciones || 'Ninguna observación registrada al momento del ingreso.'}</p>
        </div>
      </div>

      {/* Declaración y Firmas */}
      <div className="mt-12 text-justify text-xs text-gray-700 mb-20">
        <p>
          El cliente declara que los datos del vehículo y el inventario detallado en este documento reflejan el estado en el que se entrega la unidad al taller. MONFO no se hace responsable por especies de valor no declaradas y dejadas al interior del vehículo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-16 px-10">
        <div className="text-center">
          <div className="border-t border-black pt-2">
            <p className="font-bold text-sm">Firma Cliente</p>
            <p className="text-xs">{datosCliente.nombre}</p>
            <p className="text-xs">{datosCliente.rut}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-2">
            <p className="font-bold text-sm">Recibido Conforme (Taller)</p>
            <p className="text-xs">Operador: {firmas.recibidoPor}</p>
          </div>
        </div>
      </div>

    </div>
  );
});

ReceptionReceipt.displayName = 'ReceptionReceipt';