// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para cambiar de página
import { Wrench } from 'lucide-react';
import { apiClient } from '../services/axiosClient'; // Importamos nuestro cartero

export const Login = () => {
  const [codigoOperador, setCodigoOperador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    try {
      // 1. Le pedimos a Axios que envíe la petición POST al backend
      const response = await apiClient.post('/auth/login', {
        codigoOperador,
        password,
      });

      const { access_token, userData } = response.data;

      // 2. Si todo sale bien, guardamos el token
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', userData.rol);
      localStorage.setItem('userCod', userData.codigoOperador);
      console.log(`Bienvenido ${userData.codigoOperador}`);
      // (Opcional) Podemos guardar el rol o los datos del usuario si el backend los envía
      // localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard'); 
      
    } catch (err: any) {
      console.error('Error en el login', err);
      // Mostramos el mensaje de error que viene del backend (ej: "Credenciales inválidas")
      setError(
        err.response?.data?.message || 'Error al conectar con el servidor. Revisa tu conexión.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-monfo-red p-3 rounded-full mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Taller MONFO</h2>
          <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Mensaje de Error Visual */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (El resto de tus inputs siguen igual) ... */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de Operador
            </label>
            <input
              type="text"
              value={codigoOperador}
              onChange={(e) => setCodigoOperador(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-monfo-red focus:border-monfo-red outline-none transition-all"
              placeholder="Ingresa tu código"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-monfo-red focus:border-monfo-red outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-monfo-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
};