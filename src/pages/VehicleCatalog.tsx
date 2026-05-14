// src/pages/VehicleCatalog.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Plus, Edit, Trash2, History, UserPlus, Car } from 'lucide-react';
import { apiClient } from '../services/axiosClient';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: number;
  rut: string;
  name: string;
  phone: string;
}

interface Vehicle {
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

export const VehicleCatalog = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para Modal de Vehículo
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    plate: '', brand: '', model: '', year: '', color: '', customerId: ''
  });

  // Estados para el Buscador Inteligente de Clientes (Autocomplete)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Estados para Modal de Cliente
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    rut: '', nombre: '', domicilio: '', telefono: '', email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesRes, customersRes] = await Promise.all([
        apiClient.get('/vehicles'),
        apiClient.get('/customers')
      ]);
      
      const mappedVehicles = vehiclesRes.data.map((item: any) => ({
        id: item.id,
        plate: item.patente,
        brand: item.marca,
        model: item.modelo,
        year: item.anio,
        color: item.color,
        customerId: item.clienteId,
        customerName: item.cliente?.nombre || 'Desconocido',
        customerPhone: item.cliente?.telefono || 'N/A',
      }));

      const mappedCustomers = customersRes.data.map((item: any) => ({
        id: item.id,
        rut: item.rut,
        name: item.nombre,
        phone: item.telefono,
      }));
      
      setVehicles(mappedVehicles);
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CLIENTES ---
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/customers', newCustomer);
      alert('Cliente registrado correctamente.');
      setIsCustomerModalOpen(false);
      setNewCustomer({ rut: '', nombre: '', domicilio: '', telefono: '', email: '' });
      fetchData(); // Refresca para que el nuevo cliente aparezca en el buscador
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'No se pudo guardar el cliente'}`);
    }
  };

  // --- LÓGICA DE VEHÍCULOS ---
  const handleEditClick = (vehicle: Vehicle) => {
    setNewVehicle({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      customerId: vehicle.customerId.toString(),
    });
    setCustomerSearchQuery(`${vehicle.customerName} (${vehicle.plate})`); // Pre-llena el buscador visual
    setEditingVehicleId(vehicle.id);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.customerId) {
      alert('Debe seleccionar un cliente de la lista desplegable.');
      return;
    }

    try {
      const payload = {
        patente: newVehicle.plate.toUpperCase(),
        marca: newVehicle.brand,
        modelo: newVehicle.model,
        anio: parseInt(newVehicle.year) || new Date().getFullYear(),
        color: newVehicle.color,
        clienteId: parseInt(newVehicle.customerId),
      };
      
      if (editingVehicleId) {
        await apiClient.patch(`/vehicles/${editingVehicleId}`, payload);
        alert('Vehículo actualizado correctamente!');
      } else {
        await apiClient.post('/vehicles', payload);
        alert('Vehículo añadido correctamente!');
      }

      closeVehicleModal();
      fetchData(); 
    } catch (error: any) {
      alert(`Fallo al guardar: ${error.response?.data?.message || 'Error desconocido'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      fetchData(); 
    } catch (error: any) {
      alert(`No se puede eliminar: ${error.response?.data?.message || 'Error'}`);
    }
  };

  const closeVehicleModal = () => {
    setIsVehicleModalOpen(false);
    setEditingVehicleId(null);
    setCustomerSearchQuery('');
    setNewVehicle({ plate: '', brand: '', model: '', year: '', color: '', customerId: '' });
  };

  // Filtrado para la tabla principal
  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrado para el Autocomplete del Modal
  const filteredCustomersForDropdown = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.rut.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes y Vehículos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de la flota y clientes del taller.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <UserPlus className="w-5 h-5 mr-2 text-monfo-red" />
            Añadir Cliente
          </button>
          <button 
            onClick={() => setIsVehicleModalOpen(true)}
            className="flex items-center bg-monfo-red text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            <Car className="w-5 h-5 mr-2" />
            Añadir Vehículo
          </button>
        </div>
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-monfo-red focus:border-monfo-red outline-none"
              placeholder="Buscar por patente o dueño..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando flota...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              {/* (Igual que antes, la tabla se mantiene idéntica) */}
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dueño</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 uppercase">{vehicle.plate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.brand} {vehicle.model} <span className="text-gray-400">({vehicle.year})</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.customerPhone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => navigate(`/vehicles/${vehicle.id}/history`)} className="text-emerald-500 hover:text-emerald-700" title="Ver Historial"><History className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleEditClick(vehicle)} className="text-blue-500 hover:text-blue-700" title="Editar"><Edit className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDelete(vehicle.id)} className="text-red-500 hover:text-red-700" title="Eliminar"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL: AÑADIR/EDITAR VEHÍCULO --- */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingVehicleId ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}
            </h3>
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              
              {/* --- AUTOCOMPLETE DE CLIENTE --- */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dueño (Buscar por RUT o Nombre)</label>
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setShowCustomerDropdown(true);
                    setNewVehicle({...newVehicle, customerId: ''}); // Resetea si el usuario borra/cambia texto
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className={`w-full border rounded p-2 outline-none focus:border-monfo-red ${newVehicle.customerId ? 'bg-green-50 border-green-300' : 'border-gray-300'}`}
                  placeholder="Ej. Juan Pérez o 11222333-4"
                />
                
                {/* Lista Desplegable (Dropdown) */}
                {showCustomerDropdown && customerSearchQuery && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomersForDropdown.length > 0 ? (
                      filteredCustomersForDropdown.map(c => (
                        <li 
                          key={c.id} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                          onClick={() => {
                            setNewVehicle({...newVehicle, customerId: c.id.toString()});
                            setCustomerSearchQuery(`${c.name} (${c.rut})`);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          <div className="font-medium text-sm text-gray-800">{c.name}</div>
                          <div className="text-xs text-gray-500">RUT: {c.rut}</div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-500 text-center">No se encontraron clientes.</li>
                    )}
                  </ul>
                )}
                {/* Overlay invisible para cerrar el dropdown si hacen clic afuera */}
                {showCustomerDropdown && (
                  <div className="fixed inset-0 z-0" onClick={() => setShowCustomerDropdown(false)}></div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                  <input required maxLength={6} type="text" value={newVehicle.plate} onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded p-2 outline-none uppercase" placeholder="ABCD12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input required type="text" value={newVehicle.color} onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input required type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input required type="text" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input required type="text" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={closeVehicleModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-monfo-red text-white rounded hover:bg-red-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: AÑADIR CLIENTE --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Registrar Nuevo Cliente</h3>
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                <input required type="text" value={newCustomer.rut} onChange={(e) => setNewCustomer({...newCustomer, rut: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" placeholder="12345678-9" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" value={newCustomer.nombre} onChange={(e) => setNewCustomer({...newCustomer, nombre: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input required type="text" value={newCustomer.telefono} onChange={(e) => setNewCustomer({...newCustomer, telefono: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" placeholder="+569..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo (Opcional)</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio (Opcional)</label>
                <input type="text" value={newCustomer.domicilio} onChange={(e) => setNewCustomer({...newCustomer, domicilio: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};