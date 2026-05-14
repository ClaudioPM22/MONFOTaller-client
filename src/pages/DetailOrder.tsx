// src/pages/DetailOrder.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { ReceptionReceipt } from '../components/ReceptionReceipt';
import { Layout } from '../components/Layout';
import { InvoiceReceipt } from '../components/InvoiceReceipt';
import { apiClient } from '../services/axiosClient';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowLeft, Trash2, Plus, Wrench, User, Package, CheckCircle, XCircle, Handshake, Printer, Receipt } from 'lucide-react';

export const DetailOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ESTADOS PARA LOS CATÁLOGOS ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mechanicsCatalog, setMechanicsCatalog] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);

  // --- ESTADOS PARA LOS MODALES ---
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  // --- ESTADO DEL FORMULARIO DE INTERVENCIÓN ---
  const [newIntervention, setNewIntervention] = useState({
    servicioId: '',
    mecanicoId: '',
    detalles: ''
  });

  // Buscador Inteligente para Servicio
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  
  // Lista dinámica de repuestos con estado de búsqueda individual
  const [usedParts, setUsedParts] = useState<{ productoId: string, cantidad: string, searchQuery: string, showDropdown: boolean }[]>([]);

  // --- LÓGICA DE IMPRESIÓN ACTA ---
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef, 
    documentTitle: `Acta_Recepcion_OT_${id}`,
  });

  // --- LÓGICA DE IMPRESIÓN BOLETA ---
  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Liquidacion_OT_${id}`,
  });

  

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/work-orders/${id}/talonario`);
      setOrderData(response.data);
    } catch (error) {
      console.error('Error al cargar la orden:', error);
      alert('No se pudo cargar la información de la orden.');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const [servicesRes, usersRes, productsRes] = await Promise.all([
        apiClient.get('/repair-services'),
        apiClient.get('/users'),
        apiClient.get('/products')
      ]);
      setServicesCatalog(servicesRes.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMechanicsCatalog(usersRes.data.filter((u: any) => u.rol === 'MECANICO' || u.rol === 'JEFE_TALLER'));
      setProductsCatalog(productsRes.data);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };
  useEffect(() => {
    fetchOrderDetails();
    fetchCatalogs();
  }, [id, navigate]);

  // --- LÓGICAS DEL CICLO DE VIDA DE LA ORDEN ---

  const handleFinishOrder = async () => {
    if (orderData.intervencionesRealizadas.length === 0) {
      alert('No puedes finalizar una orden sin servicios asociados.');
      return;
    }
    if (!window.confirm('¿Confirmas que el vehículo está listo? Ya no se podrán agregar más servicios.')) return;

    try {
      await apiClient.patch(`/work-orders/${id}/finish`);
      alert('Orden Finalizada con éxito.');
      fetchOrderDetails();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error al finalizar: ${error.response?.data?.message || 'Revisa la consola'}`);
    }
  };

  const handleCancelOrder = async () => {
    if (orderData.intervencionesRealizadas.length > 0) {
      alert('No puedes cancelar esta orden porque ya tiene servicios asociados. Elimina los servicios primero o finaliza la orden.');
      return;
    }
    if (!window.confirm('¿Seguro que deseas cancelar esta orden de trabajo?')) return;

    try {
      await apiClient.patch(`/work-orders/${id}/cancel`);
      alert('Orden Cancelada.');
      navigate('/dashboard'); // Al cancelar, mejor volver al dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error al cancelar: ${error.response?.data?.message || 'Revisa la consola'}`);
    }
  };

  const handleDeliverOrder = async () => {
    if (!window.confirm('¿Confirmas la entrega del vehículo al cliente? Esta acción cerrará la orden definitivamente.')) return;

    try {
      await apiClient.patch(`/work-orders/${id}/close`);
      alert('¡Vehículo Entregado! La orden se ha cerrado correctamente.');
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error al entregar: ${error.response?.data?.message || 'Revisa la consola'}`);
    }
  };


  // --- LÓGICA DE REPUESTOS EN EL MODAL ---
  const addPartRow = () => {
    setUsedParts([...usedParts, { productoId: '', cantidad: '1', searchQuery: '', showDropdown: false }]);
  };

  const updatePartRow = (index: number, field: string, value: string | boolean) => {
    const updatedParts = [...usedParts];
    // Usamos as any para evitar el error de tipado al mezclar string y boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updatedParts[index] as any)[field] = value;
    setUsedParts(updatedParts);
  };

  const removePartRow = (index: number) => {
    const updatedParts = usedParts.filter((_, i) => i !== index);
    setUsedParts(updatedParts);
  };

  const handleSaveIntervention = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIntervention.servicioId) {
      alert('Debe seleccionar un servicio de la lista.');
      return;
    }

    try {
      const validParts = usedParts.filter(p => p.productoId && Number(p.cantidad) > 0);
      
      const payload = {
        ordenTrabajoId: Number(id),
        servicioId: Number(newIntervention.servicioId),
        mecanicoId: Number(newIntervention.mecanicoId),
        detalles: newIntervention.detalles,
        repuestos: validParts.map(p => ({
          productoId: Number(p.productoId),
          cantidad: Number(p.cantidad)
        }))
      };
      
      await apiClient.post('/interventions/full', payload);

      alert('Intervención guardada correctamente.');
      closeAddModal();
      fetchOrderDetails();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error guardando intervención:', error);
      alert(`Fallo al guardar: ${error.response?.data?.message || 'Revisa la consola'}`);
    }
  };

  const handleDeleteIntervention = async () => {
    if (!serviceToDelete) return;
    try {
      await apiClient.delete(`/interventions/${serviceToDelete}`);
      alert('Intervención eliminada.');
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchOrderDetails();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`Error al eliminar: ${error.response?.data?.message || 'Posiblemente tenga repuestos asociados.'}`);
      setIsDeleteModalOpen(false);
    }
  };

  const closeAddModal = () => {
    setIsAddServiceOpen(false);
    setNewIntervention({ servicioId: '', mecanicoId: '', detalles: '' });
    setServiceSearchQuery('');
    setUsedParts([]);
  };

  // Filtrados para los autocompletes
  const filteredServices = servicesCatalog.filter(s => s.nombre.toLowerCase().includes(serviceSearchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">Cargando detalles de la orden...</div>
      </Layout>
    );
  }

  if (!orderData) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver
        </button>

        <div className="flex justify-between items-end mb-8 border-b pb-4 mt-4">
          <div className="w-32"></div> {/* Espaciador para centrar el título */}
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Orden de Trabajo N° {orderData.encabezado.numeroOrden}</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              orderData.encabezado.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 
              orderData.encabezado.estado === 'FINALIZADO' ? 'bg-blue-100 text-blue-800' : 
              orderData.encabezado.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {orderData.encabezado.estado}
            </span>
          </div>

          <div className="w-32 text-right">
             {/* BOTÓN DE IMPRIMIR ACTA */}
             <button 
                onClick={handlePrintReceipt}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                title="Imprimir Acta de Recepción"
             >
                <Printer className="w-5 h-5 mr-1" /> Imprimir Acta
             </button>
             {/* BOTÓN DE IMPRIMIR BOLETA (Solo visible si ya está listo) */}
             {(orderData.encabezado.estado === 'FINALIZADO' || orderData.encabezado.estado === 'ENTREGADO') && (
               <button 
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                  title="Imprimir Liquidación"
               >
                  <Receipt className="w-5 h-5 mr-1" /> Imprimir Boleta
               </button>
             )}
          </div>
        </div>

        {/* COMPONENTE OCULTO PARA IMPRESIÓN */}
        <div className="hidden">
           <ReceptionReceipt ref={receiptRef} data={orderData} />
        </div>
        <div className="hidden">
           <InvoiceReceipt ref={invoiceRef} data={orderData} />
        </div>

        {/* --- LECTURA DE RECEPCIÓN (Igual que antes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Datos del Cliente</h3>
            <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Nombre:</span> <span className="col-span-2 font-medium">{orderData.datosCliente.nombre}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">RUT:</span> <span className="col-span-2 font-medium">{orderData.datosCliente.rut}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Domicilio:</span> <span className="col-span-2 font-medium">{orderData.datosCliente.domicilio || 'N/A'}</span></div>
            <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Contacto:</span> <span className="col-span-2 font-medium">{orderData.datosCliente.contacto}</span></div>
          </div>

          <div className="space-y-2 relative">
             <h3 className="text-sm font-semibold text-gray-500 mb-2">Datos del Vehículo</h3>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Marca:</span> <span className="col-span-2 font-medium">{orderData.datosVehiculo.marca}</span></div>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Modelo:</span> <span className="col-span-2 font-medium">{orderData.datosVehiculo.modelo}</span></div>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Año:</span> <span className="col-span-2 font-medium">{orderData.datosVehiculo.anio}</span></div>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Patente:</span> <span className="col-span-2 font-bold uppercase">{orderData.datosVehiculo.patente}</span></div>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Color:</span> <span className="col-span-2 font-medium">{orderData.datosVehiculo.color}</span></div>
             <div className="grid grid-cols-3 text-sm"><span className="text-gray-500">Km:</span> <span className="col-span-2 font-medium">{orderData.encabezado.kilometraje}</span></div>
             
             <div className="absolute top-0 right-0 text-right">
                <span className="text-xs text-gray-500 block">Recibido por:</span>
                <span className="text-sm font-medium">{orderData.firmas.recibidoPor}</span>
             </div>
          </div>
        </div>

        <div className="flex space-x-12 mb-6">
          <div className="text-sm"><span className="text-gray-500">Fecha de recepción:</span> <span className="ml-2 bg-gray-200 px-3 py-1 rounded-full font-medium">{new Date(orderData.encabezado.fechaRecepcion).toLocaleDateString('es-CL')}</span></div>
          {orderData.encabezado.fechaEntregaEstimada && (
            <div className="text-sm"><span className="text-gray-500">Fecha de entrega est:</span> <span className="ml-2 bg-gray-200 px-3 py-1 rounded-full font-medium">{new Date(orderData.encabezado.fechaEntregaEstimada).toLocaleDateString('es-CL')}</span></div>
          )}
        </div>

        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-4 gap-4 text-sm mb-4">
            {orderData.estadoRecepcion.checklist && Object.entries(orderData.estadoRecepcion.checklist).map(([key, value]) => {
              if (typeof value !== 'boolean') return null;
              return (
                <div key={key} className="flex justify-between items-center pr-4">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <input type="checkbox" readOnly checked={value as boolean} className="rounded text-monfo-red h-4 w-4 pointer-events-none" />
                </div>
              );
            })}
            <div className="flex justify-between items-center pr-4 font-medium">
               <span className="text-gray-600">Nivel Bencina</span>
               <span>{orderData.estadoRecepcion.nivelBencina}</span>
            </div>
          </div>
          <div className="text-sm border-t pt-2">
            <span className="text-gray-500">Observaciones:</span> <span className="ml-2">{orderData.detalles.observaciones || 'Ninguna'}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm text-gray-500 mb-2">Solicitud del cliente:</h3>
          <div className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 min-h-[80px]">
            {orderData.detalles.requerimientosCliente}
          </div>
        </div>

        {/* --- SERVICIOS E INTERVENCIONES --- */}
        <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Servicios Realizados:</h3>
          </div>
          
          {orderData.intervencionesRealizadas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay servicios registrados aún.</div>
          ) : (
            <div className="p-4 space-y-4 bg-white">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {orderData.intervencionesRealizadas.map((int: any) => (
                <div key={int.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center">
                        <Wrench className="w-4 h-4 mr-2 text-monfo-dark" />
                        {int.servicio.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 italic">"{int.detalles}"</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <User className="w-3 h-3 mr-1" /> {int.mecanico}
                      </span>
                      {orderData.encabezado.estado === 'PENDIENTE' && (
                        <button 
                          onClick={() => { setServiceToDelete(int.id); setIsDeleteModalOpen(true); }} 
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Eliminar intervención"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {int.repuestos && int.repuestos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Repuestos utilizados:</p>
                      <div className="flex flex-wrap gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {int.repuestos.map((rep: any) => (
                          <span key={rep.id} className="inline-flex items-center px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-xs shadow-sm">
                            <Package className="w-3 h-3 mr-1 text-gray-400" />
                            {rep.cantidad} x {rep.producto}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTONES DE ACCIÓN SEGÚN EL ESTADO */}
        {orderData.encabezado.estado === 'PENDIENTE' && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleFinishOrder}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Finalizar Orden
              </button>
              <button 
                onClick={handleCancelOrder}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-sm flex items-center"
              >
                 <XCircle className="w-4 h-4 mr-2" /> Cancelar Orden
              </button>
            </div>
            <button 
              onClick={() => setIsAddServiceOpen(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-2"/> Agregar intervención
            </button>
          </div>
        )}

        {orderData.encabezado.estado === 'FINALIZADO' && (
          <div className="flex justify-end items-center">
            <button 
              onClick={handleDeliverOrder}
              className="px-8 py-3 bg-monfo-dark text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors shadow-lg flex items-center"
            >
               <Handshake className="w-5 h-5 mr-2" /> Entregar Vehículo al Cliente
            </button>
          </div>
        )}

      </div>

      {/* --- MODALES --- */}

      {/* Modal: Agregar Servicio con Repuestos */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Registrar Nueva Intervención</h3>
            <form onSubmit={handleSaveIntervention} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* AUTOCOMPLETE PARA SERVICIO */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio Realizado</label>
                  <input
                    type="text"
                    required
                    value={serviceSearchQuery}
                    onChange={(e) => {
                      setServiceSearchQuery(e.target.value);
                      setShowServiceDropdown(true);
                      setNewIntervention({...newIntervention, servicioId: ''});
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    className={`w-full border rounded p-2 outline-none text-sm ${newIntervention.servicioId ? 'bg-green-50 border-green-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Buscar servicio..."
                  />
                  {showServiceDropdown && serviceSearchQuery && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredServices.length > 0 ? (
                        filteredServices.map(s => (
                          <li 
                            key={s.id} 
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-sm"
                            onClick={() => {
                              setNewIntervention({...newIntervention, servicioId: s.id.toString()});
                              setServiceSearchQuery(s.nombre);
                              setShowServiceDropdown(false);
                            }}
                          >
                            {s.nombre}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-sm text-gray-500 text-center">No encontrado</li>
                      )}
                    </ul>
                  )}
                  {showServiceDropdown && (
                    <div className="fixed inset-0 z-10" onClick={() => setShowServiceDropdown(false)}></div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mecánico Asignado</label>
                  <select 
                    required 
                    value={newIntervention.mecanicoId} 
                    onChange={(e) => setNewIntervention({...newIntervention, mecanicoId: e.target.value})} 
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="" disabled>Seleccione un mecánico...</option>
                    {mechanicsCatalog.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigoOperador})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del trabajo</label>
                <textarea 
                  required 
                  value={newIntervention.detalles} 
                  onChange={(e) => setNewIntervention({...newIntervention, detalles: e.target.value})} 
                  rows={3} 
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500 text-sm resize-none" 
                  placeholder="Detalles de la reparación o diagnóstico..."
                ></textarea>
              </div>

              {/* SECCIÓN DINÁMICA DE REPUESTOS CON AUTOCOMPLETE */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Repuestos Utilizados (Opcional)</label>
                  <button type="button" onClick={addPartRow} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> Añadir repuesto
                  </button>
                </div>
                
                {usedParts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No se han añadido repuestos a esta intervención.</p>
                ) : (
                  <div className="space-y-3">
                    {usedParts.map((part, index) => {
                      const filteredProducts = productsCatalog.filter(p => p.nombre.toLowerCase().includes(part.searchQuery.toLowerCase()));
                      
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          
                          {/* Autocomplete de Repuestos Individual */}
                          <div className="relative flex-1">
                            <input
                              type="text"
                              required
                              value={part.searchQuery}
                              onChange={(e) => {
                                updatePartRow(index, 'searchQuery', e.target.value);
                                updatePartRow(index, 'showDropdown', true);
                                updatePartRow(index, 'productoId', '');
                              }}
                              onFocus={() => updatePartRow(index, 'showDropdown', true)}
                              className={`w-full border rounded p-1.5 outline-none text-sm ${part.productoId ? 'bg-green-50 border-green-300' : 'border-gray-300 focus:border-blue-500'}`}
                              placeholder="Buscar repuesto..."
                            />
                            {part.showDropdown && part.searchQuery && (
                              <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                  filteredProducts.map(p => (
                                    <li 
                                      key={p.id} 
                                      className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-xs"
                                      onClick={() => {
                                        updatePartRow(index, 'productoId', p.id.toString());
                                        updatePartRow(index, 'searchQuery', p.nombre);
                                        updatePartRow(index, 'showDropdown', false);
                                      }}
                                    >
                                      {p.nombre}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-3 py-1.5 text-xs text-gray-500 text-center">No encontrado</li>
                                )}
                              </ul>
                            )}
                            {part.showDropdown && (
                              <div className="fixed inset-0 z-10" onClick={() => updatePartRow(index, 'showDropdown', false)}></div>
                            )}
                          </div>

                          <input 
                            required
                            type="number"
                            min="1"
                            value={part.cantidad}
                            onChange={(e) => updatePartRow(index, 'cantidad', e.target.value)}
                            className="w-20 border border-gray-300 rounded p-1.5 outline-none text-sm text-center focus:border-blue-500"
                            placeholder="Cant."
                          />
                          <button type="button" onClick={() => removePartRow(index)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={closeAddModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition-colors">Guardar Intervención</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Eliminar Servicio */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[400px] shadow-xl text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-6">¿Seguro que desea eliminar esta intervención?</h3>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors">Volver</button>
              <button onClick={handleDeleteIntervention} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};