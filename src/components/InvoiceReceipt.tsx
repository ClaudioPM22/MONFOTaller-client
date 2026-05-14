// src/components/InvoiceReceipt.tsx
import React, { forwardRef } from 'react';
import { Wrench } from 'lucide-react';

interface Props {
  data: any;
}

export const InvoiceReceipt = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  const { encabezado, datosCliente, datosVehiculo, intervencionesRealizadas } = data;
  const fechaHoy = new Date().toLocaleDateString('es-CL');

  // Cálculos dinámicos
  let totalManoObra = 0;
  let totalRepuestos = 0;

  return (
    <div ref={ref} className="bg-white text-black p-10 w-[210mm] min-h-[297mm] mx-auto text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-6">
        <div className="flex items-center">
          <Wrench className="w-10 h-10 mr-3 text-black" />
          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase">MONFO</h1>
            <p className="text-xs text-gray-600">Servicio Técnico Automotriz</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase">Liquidación de Servicio</h2>
          <p className="font-medium text-lg">Orden N°: {encabezado.numeroOrden}</p>
          <p className="text-sm text-gray-600">Fecha Emisión: {fechaHoy}</p>
        </div>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="text-sm">
          <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 uppercase text-xs text-gray-500">Cliente</h3>
          <p><span className="font-semibold">RUT:</span> {datosCliente.rut}</p>
          <p><span className="font-semibold">Nombre:</span> {datosCliente.nombre}</p>
          <p><span className="font-semibold">Teléfono:</span> {datosCliente.contacto}</p>
        </div>
        <div className="text-sm">
          <h3 className="font-bold border-b border-gray-300 pb-1 mb-2 uppercase text-xs text-gray-500">Vehículo</h3>
          <p><span className="font-semibold uppercase">{datosVehiculo.patente}</span> - {datosVehiculo.marca} {datosVehiculo.modelo} ({datosVehiculo.anio})</p>
          <p><span className="font-semibold">Km Ingreso:</span> {encabezado.kilometraje.toLocaleString()} km</p>
        </div>
      </div>

      {/* Tabla de Detalles */}
      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase">
            <th className="py-2">Descripción</th>
            <th className="py-2 text-center">Cant.</th>
            <th className="py-2 text-right">P. Unitario</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {intervencionesRealizadas.map((int: any) => {
            const costoServicio = int.servicio.precioBase || 0;
            totalManoObra += costoServicio;

            return (
              <React.Fragment key={int.id}>
                {/* Fila del Servicio (Mano de Obra) */}
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-semibold">
                    [Mano de Obra] {int.servicio.nombre}
                    <div className="text-xs text-gray-500 font-normal italic mt-0.5">"{int.detalles}"</div>
                  </td>
                  <td className="py-3 text-center">1</td>
                  <td className="py-3 text-right">${costoServicio.toLocaleString('es-CL')}</td>
                  <td className="py-3 text-right font-medium">${costoServicio.toLocaleString('es-CL')}</td>
                </tr>

                {/* Filas de los Repuestos usados en este servicio */}
                {int.repuestos?.map((rep: any) => {
                  const costoRepuesto = rep.costoAlMomento || 0;
                  const subtotalRep = costoRepuesto * rep.cantidad;
                  totalRepuestos += subtotalRep;

                  return (
                    <tr key={rep.id} className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2 pl-6 text-gray-700 text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>
                        [Repuesto] {rep.producto}
                      </td>
                      <td className="py-2 text-center text-sm">{rep.cantidad}</td>
                      <td className="py-2 text-right text-sm">${costoRepuesto.toLocaleString('es-CL')}</td>
                      <td className="py-2 text-right text-sm">${subtotalRep.toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Totales */}
      <div className="w-1/2 ml-auto border border-black rounded-lg p-4">
        <div className="flex justify-between mb-2 text-sm">
          <span>Subtotal Mano de Obra:</span>
          <span>${totalManoObra.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span>Subtotal Repuestos:</span>
          <span>${totalRepuestos.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t-2 border-black font-bold text-lg">
          <span>TOTAL A PAGAR:</span>
          <span>${(totalManoObra + totalRepuestos).toLocaleString('es-CL')}</span>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-gray-500">
        <p>Gracias por confiar en nuestros servicios.</p>
        <p>Documento no válido como factura o boleta legal del SII.</p>
      </div>

    </div>
  );
});

InvoiceReceipt.displayName = 'InvoiceReceipt';