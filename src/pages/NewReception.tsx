// src/pages/NewReception.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Search, Save, X } from 'lucide-react'; // <-- Agregamos Search
import { apiClient } from '../services/axiosClient';

export const NewReception = () => {
  const navigate = useNavigate();
  const userCod = localStorage.getItem('userCod') || 'O-000';
  const fechaActual = new Date().toLocaleDateString('es-CL');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 1. ESTADOS AGRUPADOS
  const [cliente, setCliente] = useState({
    rut: '', nombre: '', domicilio: '', contacto: ''
  });

  const [vehiculo, setVehiculo] = useState({
    patente: '', marca: '', modelo: '', anio: '', color: ''
  });

  const [recepcion, setRecepcion] = useState({
    kilometraje: '', nivelBencina: '', observaciones: '', requerimientosCliente: '', fechaEntregaEstimada: ''
  });

  const [checklist, setChecklist] = useState({
    documentos: false, radio: false, encendedor: false, gomasPiso: false,
    extintor: false, triangulo: false, botiquin: false, gata: false,
    herramientas: false, antena: false, neumaticoRep: false, tapaRuedas: false,
    tapaBencina: false, espejos: false, plumillas: false
  });

  // 2. MANEJADORES DE BÚSQUEDA Y CAMBIOS
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/vehicles/search/${searchQuery}`);
      const data = response.data;

      // Autocompletamos los estados con la info de la DB
      setVehiculo({
        patente: data.patente,
        marca: data.marca,
        modelo: data.modelo,
        anio: data.anio.toString(),
        color: data.color,
      });

      setCliente({
        rut: data.cliente.rut,
        nombre: data.cliente.nombre,
        domicilio: data.cliente.domicilio || '',
        contacto: data.cliente.telefono,
      });

    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Vehículo no encontrado. Por favor, ingrese los datos manualmente para registrarlo.');
        // Pre-llenamos la patente que el usuario buscó para ahorrarle tiempo
        setVehiculo({ patente: searchQuery.toUpperCase(), marca: '', modelo: '', anio: '', color: '' });
        setCliente({ rut: '', nombre: '', domicilio: '', contacto: '' });
      } else {
        console.error('Error al buscar:', error);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleVehiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'patente' ? e.target.value.toUpperCase() : e.target.value;
    setVehiculo({ ...vehiculo, [e.target.name]: value });
  };

  const handleRecepcionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRecepcion({ ...recepcion, [e.target.name]: e.target.value });
  };

  const handleChecklistToggle = (item: string) => {
    setChecklist({ ...checklist, [item]: !checklist[item as keyof typeof checklist] });
  };

  // 3. ENVÍO AL BACKEND
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        cliente,
        vehiculo: {
          ...vehiculo,
          anio: parseInt(vehiculo.anio) || new Date().getFullYear(),
        },
        checklist,
        kilometraje: parseInt(recepcion.kilometraje) || 0,
        nivelBencina: recepcion.nivelBencina,
        observaciones: recepcion.observaciones,
        requerimientosCliente: recepcion.requerimientosCliente,
        fechaEntregaEstimada: recepcion.fechaEntregaEstimada || undefined,
      };

      await apiClient.post('/work-orders/reception', payload);

      alert('¡Recepción ingresada con éxito!');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error al guardar:', error);
      const backendError = error.response?.data?.message;
      alert(`Hubo un error al guardar: ${backendError || 'Revisa la consola'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* ENCABEZADO Y BÚSQUEDA */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar patente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Evita que el formulario haga submit
                    handleSearch();
                  }
                }}
                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-monfo-red focus:ring-2 focus:ring-monfo-red outline-none transition-all w-64 uppercase"
              />
            </div>
            <button 
              type="button" 
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            {fechaActual}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
            
            {/* Columna Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Datos del Cliente</h3>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">RUT:</label>
                <input required type="text" name="rut" value={cliente.rut} onChange={handleClienteChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Nombre:</label>
                <input required type="text" name="nombre" value={cliente.nombre} onChange={handleClienteChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Domicilio:</label>
                <input type="text" name="domicilio" value={cliente.domicilio} onChange={handleClienteChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Contacto:</label>
                <input required type="text" name="contacto" value={cliente.contacto} onChange={handleClienteChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
            </div>

            {/* Columna Vehículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Datos del Vehículo</h3>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Patente:</label>
                <input required type="text" name="patente" value={vehiculo.patente} onChange={handleVehiculoChange} maxLength={6} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1 uppercase font-bold text-gray-800 tracking-wider" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Marca:</label>
                <input required type="text" name="marca" value={vehiculo.marca} onChange={handleVehiculoChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Modelo:</label>
                <input required type="text" name="modelo" value={vehiculo.modelo} onChange={handleVehiculoChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-6 items-center gap-2">
                <label className="col-span-2 text-sm text-gray-600 font-medium">Año:</label>
                <input required type="number" name="anio" value={vehiculo.anio} onChange={handleVehiculoChange} className="col-span-1 border-b border-gray-300 focus:border-monfo-red outline-none py-1 text-center" />
                <label className="col-span-1 text-sm text-gray-600 font-medium text-right pr-2">Color:</label>
                <input required type="text" name="color" value={vehiculo.color} onChange={handleVehiculoChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Km Actual:</label>
                <input required type="number" name="kilometraje" value={recepcion.kilometraje} onChange={handleRecepcionChange} className="col-span-2 border-b border-gray-300 focus:border-monfo-red outline-none py-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-4">
               <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 font-medium w-36">Fecha recepción:</label>
                  <span className="bg-gray-200 px-3 py-1 rounded-md text-sm text-gray-700">{fechaActual}</span>
               </div>
               <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-600 font-medium w-36">Fecha entrega est.:</label>
                  <input type="date" name="fechaEntregaEstimada" value={recepcion.fechaEntregaEstimada} onChange={handleRecepcionChange} className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-monfo-red outline-none" />
               </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 block mb-1">Recibido por (Operador):</span>
              <span className="font-semibold text-gray-800 border-b border-gray-300 px-4 py-1">{userCod}</span>
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="border border-gray-300 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.keys(checklist).map((key) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={checklist[key as keyof typeof checklist]}
                    onChange={() => handleChecklistToggle(key)}
                    className="rounded text-monfo-red focus:ring-monfo-red h-4 w-4" 
                  />
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
              
              <div className="flex items-center space-x-2">
                 <label className="text-sm text-gray-600 font-medium">Nivel Bencina:</label>
                 <select required name="nivelBencina" value={recepcion.nivelBencina} onChange={handleRecepcionChange} className="border border-gray-300 rounded text-sm py-1 px-2 focus:border-monfo-red outline-none">
                    <option value="">Seleccionar</option>
                    <option value="LLENO">Lleno</option>
                    <option value="TRES_CUARTOS">3/4</option>
                    <option value="MEDIO">Medio</option>
                    <option value="UN_CUARTO">1/4</option>
                    <option value="VACIO">Reserva/Vacío</option>
                 </select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-600 font-medium">Observaciones:</label>
              <input type="text" name="observaciones" value={recepcion.observaciones} onChange={handleRecepcionChange} className="flex-1 border-b border-gray-300 focus:border-monfo-red outline-none py-1" placeholder="Ej: Rayón puerta delantera..." />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Solicitud del Cliente (Requerimientos):</label>
            <textarea 
              required
              rows={4}
              name="requerimientosCliente"
              value={recepcion.requerimientosCliente}
              onChange={handleRecepcionChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-monfo-red focus:border-monfo-red outline-none resize-none"
              placeholder="Ej: Cambio de aceite y revisión de frenos porque suenan al detenerse..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 mr-2" /> Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
};