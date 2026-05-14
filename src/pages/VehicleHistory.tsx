// src/pages/VehicleHistory.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/axiosClient';
import { ArrowLeft, Calendar, Gauge, Wrench, Package, User, TrendingUp } from 'lucide-react';

export const VehicleHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get(`/vehicles/${id}/history`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
        alert('No se pudo cargar el historial del vehículo.');
        navigate('/vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [id, navigate]);

  if (isLoading) return <Layout><div className="text-center py-20">Cargando historial clínico...</div></Layout>;
  if (!data) return null;

  // Calculamos el total de intervenciones realizadas a lo largo del tiempo
  const totalInterventions = data.history.reduce((acc: number, order: any) => acc + order.intervenciones.length, 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Botón Volver */}
        <button 
          onClick={() => navigate('/vehicles')}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al catálogo
        </button>

        {/* Header: Perfil del Vehículo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-6">
            <div className="bg-monfo-dark p-4 rounded-xl">
              <span className="text-monfo-red text-2xl font-black tracking-tighter uppercase">{data.vehicle.patente}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{data.vehicle.marca} {data.vehicle.modelo}</h1>
              <p className="text-gray-500">Año {data.vehicle.anio} • Color {data.vehicle.color}</p>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-4">
             <div className="text-center px-6 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-400 uppercase font-bold">Visitas Totales</span>
                <span className="text-2xl font-bold text-monfo-dark">{data.totalVisits}</span>
             </div>
             <div className="text-center px-6 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-400 uppercase font-bold">Intervenciones</span>
                <span className="text-2xl font-bold text-monfo-dark">{totalInterventions}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información y Estadísticas */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Resumen de Salud
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Última Visita:</span>
                  <span className="font-medium text-gray-800">
                    {data.history.length > 0 
                      ? new Date(data.history[data.history.length - 1].fechaRecepcion).toLocaleDateString('es-CL') 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Km de última visita:</span>
                  <span className="font-medium text-gray-800">
                    {data.history.length > 0 
                      ? data.history[data.history.length - 1].kilometraje.toLocaleString() + ' km'
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Cronología de Órdenes Finalizadas */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-monfo-red" />
              Línea de Tiempo de Intervenciones
            </h3>

            {data.history.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
                Este vehículo aún no tiene órdenes de trabajo finalizadas en el sistema.
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-200">
                {data.history.map((order: any, idx: number) => (
                  <div key={order.id} className="relative pl-12">
                    {/* El punto de la línea de tiempo */}
                    <div className="absolute left-0 top-2 w-8 h-8 bg-white border-4 border-monfo-red rounded-full z-10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-monfo-red rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Cabecera de la Visita */}
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-bold text-gray-800">Orden #{order.id}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(order.fechaRecepcion).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                           <Gauge className="w-3 h-3 mr-1" />
                           {order.kilometraje.toLocaleString()} km
                        </div>
                      </div>

                      {/* Detalles de las Intervenciones en esta visita */}
                      <div className="p-6 space-y-6">
                        {order.intervenciones.map((int: any) => (
                          <div key={int.id} className="border-l-2 border-blue-100 pl-4 py-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-gray-800 flex items-center">
                                  <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                                  {int.servicio.nombre}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 italic">"{int.detalles}"</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-400 flex items-center justify-end">
                                  <User className="w-3 h-3 mr-1" /> {int.mecanico.nombre}
                                </span>
                              </div>
                            </div>

                            {/* Repuestos Usados en esta intervención */}
                            {int.repuestosUsados.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {int.repuestosUsados.map((part: any) => (
                                  <span key={part.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                                    <Package className="w-3 h-3 mr-1 text-gray-400" />
                                    {part.cantidad} x {part.producto.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};