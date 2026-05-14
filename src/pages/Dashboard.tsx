import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Eye, Plus, Search, Car, Calendar, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/axiosClient';
import { useNavigate } from 'react-router-dom';

interface WorkOrder {
  id: number;
  patente: string;
  vehiculo: string;
  cliente: string;
  estado: string;
  codigoOperador: string;
  fechaIngreso: string;
}

export const Dashboard = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/work-orders/dashboard/active');
        
        const formattedOrders = response.data.map((item: any) => ({
          id: item.id,
          patente: item.vehiculo?.patente || 'Sin Patente',
          vehiculo: `${item.vehiculo?.marca || ''} ${item.vehiculo?.modelo || ''}`,
          cliente: item.vehiculo?.cliente?.nombre || 'Desconocido',
          estado: item.estado,
          codigoOperador: item.usuario.codigoOperador,
          fechaIngreso: new Date(item.fechaRecepcion).toLocaleDateString('es-CL'),
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // --- CÁLCULO DE MÉTRICAS (Basado en tu mockup) ---
  // Vehículos que no han sido entregados al cliente
  const vehiculosEnTaller = orders.filter(o => o.estado !== 'ENTREGADO').length; 
  // Entregas pendientes (Autos que ya están reparados/finalizados pero siguen en el taller)
  const entregasPendientes = orders.filter(o => o.estado === 'FINALIZADO').length;
  // (Simulado) Ingresos de hoy: En un caso real compararíamos la fechaIngreso con la fecha actual
  const ingresosHoy = orders.filter(o => o.fechaIngreso === new Date().toLocaleDateString('es-CL')).length;

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'EN_REVISION': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">En Revisión</span>;
      case 'REPARANDO': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Reparando</span>;
      case 'FINALIZADO': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Listo para Entrega</span>;
      default: return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{estado}</span>;
    }
  };

  return (
    <Layout>
      {/* HEADER DE LA PÁGINA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de operaciones del Taller MONFO.</p>
        </div>
        <button
        onClick={() => navigate('/nueva-recepcion')}
        className="flex items-center bg-monfo-red text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-md font-medium">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Ingreso
        </button>
      </div>

      {/* FILA DE MÉTRICAS (Inspirado en tu mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1: Vehículos en el taller */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-50 rounded-lg mr-4">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vehículos en el Taller</p>
            <p className="text-3xl font-bold text-gray-800">{isLoading ? '-' : vehiculosEnTaller}</p>
          </div>
        </div>

        {/* Tarjeta 2: Ingresos Hoy */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-monfo-red/10 rounded-lg mr-4">
            <Calendar className="w-8 h-8 text-monfo-red" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ingresos Hoy</p>
            <p className="text-3xl font-bold text-gray-800">{isLoading ? '-' : ingresosHoy}</p>
          </div>
        </div>

        {/* Tarjeta 3: Entregas Pendientes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-green-50 rounded-lg mr-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Por Entregar</p>
            <p className="text-3xl font-bold text-gray-800">{isLoading ? '-' : entregasPendientes}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE LA TABLA */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Listado de Vehículos</h2>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-monfo-red focus:border-monfo-red outline-none"
              placeholder="Buscar patente o cliente..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium animate-pulse">Cargando datos del taller...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehículo / Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingreso</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mecanico</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-300 uppercase tracking-widest">{order.patente}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.vehiculo}</div>
                      <div className="text-sm text-gray-500">{order.cliente}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fechaIngreso}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.codigoOperador}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/orden/${order.id}`)} // <-- Agregamos la navegación aquí
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!isLoading && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay vehículos en el taller actualmente.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};