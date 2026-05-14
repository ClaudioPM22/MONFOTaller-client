// src/pages/ServiceCatalog.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../services/axiosClient';

interface Service {
  id: number;
  name: string;
  basePrice: number;
}

export const ServiceCatalog = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const [newService, setNewService] = useState({ name: '', basePrice: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/repair-services');
      
      const mappedServices = response.data.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        basePrice: item.precioBase,
      }));
      
      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Error cargando los servicios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Función para abrir el modal en modo EDICIÓN
  const handleEditClick = (service: Service) => {
    setNewService({
      name: service.name,
      basePrice: service.basePrice.toString(),
    });
    setEditingServiceId(service.id);
    setIsAddModalOpen(true);
  };

  // Función unificada para GUARDAR (POST) o ACTUALIZAR (PATCH)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: newService.name,
        precioBase: parseFloat(newService.basePrice),
      };
      
      if (editingServiceId) {
        // EDICIÓN (PATCH)
        await apiClient.patch(`/repair-services/${editingServiceId}`, payload);
        alert('Servicio actualizado correctamente!');
      } else {
        // CREACIÓN (POST)
        await apiClient.post('/repair-services', payload);
        alert('Servicio añadido correctamente!');
      }

      closeModal();
      fetchServices();
    } catch (error) {
      console.error('Error guardando el servicio:', error);
      alert('Fallo al guardar el servicio. Revisa la consola.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
    
    try {
      await apiClient.delete(`/repair-services/${id}`);
      alert('Servicio eliminado correctamente!');
      fetchServices(); 
    } catch (error) {
      console.error('Error eliminando el servicio:', error);
      alert('Fallo al eliminar el servicio.');
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingServiceId(null);
    setNewService({ name: '', basePrice: '' });
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catálogo de servicios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de los servicios ofrecidos.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-monfo-red text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir Servicio
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-monfo-red focus:border-monfo-red outline-none"
              placeholder="Buscar servicio por nombre"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando servicios...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio base</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{service.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${service.basePrice.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(service)} // Conectado
                        className="text-blue-500 hover:text-blue-700 mr-4 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron servicios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            {/* TÍTULO DINÁMICO */}
            <h3 className="text-lg font-bold mb-4 text-gray-800">
               {editingServiceId ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
            </h3>
            {/* FORMULARIO CONECTADO */}
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
                <input 
                  required
                  type="text" 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-red"
                  placeholder="Ej. Cambio de Aceite"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base ($)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={newService.basePrice}
                  onChange={(e) => setNewService({...newService, basePrice: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-red"
                  placeholder="25000"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-monfo-red text-white font-medium rounded hover:bg-red-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};