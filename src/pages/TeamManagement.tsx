// src/pages/TeamManagement.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Plus, Edit, Trash2, Shield, Wrench } from 'lucide-react';
import { apiClient } from '../services/axiosClient';

interface User {
  id: number;
  nombre: string;
  codigoOperador: string;
  rol: string;
  createdAt: string;
}

export const TeamManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [newUser, setNewUser] = useState({
    nombre: '',
    codigoOperador: '',
    rol: 'MECANICO',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error al cargar el personal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setNewUser({
      nombre: user.nombre,
      codigoOperador: user.codigoOperador,
      rol: user.rol,
      password: '', // Importante: Nunca mostramos ni rellenamos la contraseña anterior
    });
    setEditingUserId(user.id);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Si estamos editando y la contraseña está vacía, la eliminamos del payload para no sobrescribirla
      const payload: any = {
        nombre: newUser.nombre,
        codigoOperador: newUser.codigoOperador,
        rol: newUser.rol,
      };

      if (newUser.password) {
        payload.password = newUser.password;
      }

      if (editingUserId) {
        await apiClient.patch(`/users/${editingUserId}`, payload);
        alert('Usuario actualizado correctamente.');
      } else {
        if (!newUser.password) {
          alert('La contraseña es obligatoria para usuarios nuevos.');
          return;
        }
        await apiClient.post('/users', payload);
        alert('Usuario creado correctamente.');
      }

      closeModal();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(`Fallo al guardar: ${error.response?.data?.message || 'Error desconocido'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`No se puede eliminar: ${error.response?.data?.message || 'Error'}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setNewUser({ nombre: '', codigoOperador: '', rol: 'MECANICO', password: '' });
  };

  const filteredUsers = users.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.codigoOperador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Administración de accesos para Mecánicos y Jefes de Taller.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-monfo-dark text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir Personal
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-monfo-dark"
              placeholder="Buscar por nombre o código..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Cargando personal...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Ingreso</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {user.codigoOperador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.rol === 'JEFE_TALLER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rol === 'JEFE_TALLER' ? <Shield className="w-3 h-3 mr-1" /> : <Wrench className="w-3 h-3 mr-1" />}
                        {user.rol.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditClick(user)} className="text-blue-500 hover:text-blue-700">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingUserId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" value={newUser.nombre} onChange={(e) => setNewUser({...newUser, nombre: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-dark" placeholder="Ej. Carlos Mendoza" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Operador</label>
                  <input required type="text" value={newUser.codigoOperador} onChange={(e) => setNewUser({...newUser, codigoOperador: e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-dark uppercase" placeholder="M002" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol en Sistema</label>
                  <select required value={newUser.rol} onChange={(e) => setNewUser({...newUser, rol: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-dark bg-white">
                    <option value="MECANICO">Mecánico</option>
                    <option value="JEFE_TALLER">Jefe de Taller</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required={!editingUserId} 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  className="w-full border border-gray-300 rounded p-2 outline-none focus:border-monfo-dark" 
                  placeholder={editingUserId ? "Dejar en blanco para mantener actual" : "Asignar contraseña inicial"} 
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-monfo-dark text-white rounded hover:bg-gray-800">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};