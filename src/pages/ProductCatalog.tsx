// src/pages/ProductCatalog.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../services/axiosClient';

// Interfaz en inglés actuando como puente
interface Product {
  id: number;
  name: string;
  quantity: number;
  unitCost: number;
  clientPrice: number;
}

export const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    quantity: '0', // Referencial, ya que no descontaremos inventario aún
    unitCost: '', 
    clientPrice: '' 
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/products');
      
      // Traducción del JSON del backend a la interfaz del frontend
      const mappedProducts = response.data.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        quantity: item.cantidad,
        unitCost: item.costoUnitario,
        clientPrice: item.precioCliente,
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (product: Product) => {
    setNewProduct({
      name: product.name,
      quantity: product.quantity.toString(),
      unitCost: product.unitCost.toString(),
      clientPrice: product.clientPrice.toString(),
    });
    setEditingProductId(product.id);
    setIsAddModalOpen(true);
  };

  // Esta función ahora maneja tanto la CREACIÓN como la EDICIÓN
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: newProduct.name,
        cantidad: parseInt(newProduct.quantity) || 0,
        costoUnitario: parseFloat(newProduct.unitCost),
        precioCliente: parseFloat(newProduct.clientPrice),
      };
      
      if (editingProductId) {
        // SI HAY UN ID, ES UNA EDICIÓN (PATCH)
        await apiClient.patch(`/products/${editingProductId}`, payload);
        alert('Producto actualizado correctamente!');
      } else {
        // SI NO HAY ID, ES UNA CREACIÓN (POST)
        await apiClient.post('/products', payload);
        alert('Producto añadido correctamente!');
      }

      // Limpiamos y cerramos todo
      closeModal();
      fetchProducts(); 
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Fallo al guardar el producto. Revisa la consola.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      await apiClient.delete(`/products/${id}`);
      alert('Producto eliminado correctamente!');
      fetchProducts(); 
    } catch (error) {
      console.error('Error eliminando el producto: ', error);
      alert('Fallo al eliminar el producto.');
    }
  };

  // Función auxiliar para cerrar el modal limpiamente
  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ name: '', quantity: '0', unitCost: '', clientPrice: '' });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Repuestos y catálogo de Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestionar las piezas de repuesto y sus precios para las intervenciones.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center bg-monfo-red text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir Producto
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
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Búsqueda por nombre..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando catálogo...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo Cliente</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.unitCost.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${product.clientPrice.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="text-blue-500 hover:text-blue-700 mr-4 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron productos.
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
              {editingProductId ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h3>
            {/* FORMULARIO APUNTANDO AL HANDLER CORRECTO */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Repuesto</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
                  placeholder="Ej. Filtro de Aceite"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={newProduct.unitCost}
                    onChange={(e) => setNewProduct({...newProduct, unitCost: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
                    placeholder="3000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Cliente ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={newProduct.clientPrice}
                    onChange={(e) => setNewProduct({...newProduct, clientPrice: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 outline-none focus:border-blue-500"
                    placeholder="5000"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
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