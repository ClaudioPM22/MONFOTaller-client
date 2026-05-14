// src/components/Layout.tsx
import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Wrench, Car, Users, Package, Box, LogOut, Shield} from 'lucide-react'; // Agregamos Box para repuestos


interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- ¡El espía que nos dice en qué URL estamos!
  
  const userRole = localStorage.getItem('userRole');
  const userCod = localStorage.getItem('userCod');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

 
  const getLinkClasses = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-monfo-red text-white shadow-md' // Estilo ACTIVO
        : 'text-gray-400 hover:bg-gray-800 hover:text-white' // Estilo INACTIVO
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-monfo-dark text-white flex flex-col">
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <Wrench className="w-6 h-6 text-monfo-red mr-2" />
          <span className="text-xl font-bold tracking-wider">MONFO</span>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          
          {/* TODOS ven este botón */}
          <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
            <Car className="w-5 h-5 mr-3" />
            Órdenes de Trabajo
          </Link>

          <Link to="/vehicles" className={getLinkClasses('/vehicles')}>
                <Users className="w-5 h-5 mr-3" />
                Clientes y Vehículos
              </Link>

          {/* SOLO JEFE_TALLER */}
          {userRole === 'JEFE_TALLER' && (
            <>
              <Link to="/repair-services" className={getLinkClasses('/repair-services')}>
                <Package className="w-5 h-5 mr-3" />
                Catálogo de Servicios
              </Link>

              <Link to="/products" className={getLinkClasses('/products')}>
                <Box className="w-5 h-5 mr-3" />
                Catálogo Repuestos
              </Link>
              
              <Link to="/team" className={getLinkClasses('/team')}>
                <Shield className="w-5 h-5 mr-3" />
                Gestión de Personal
              </Link>
            </>
          )}

        </nav>

        {/* Info de Usuario y Salir */}
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 px-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Usuario activo</p>
            <p className="font-semibold text-white truncate" title={userCod || 'Desconocido'}>
              {userCod}
            </p>
            <p className="text-xs font-medium text-monfo-red mt-1">
              {userRole?.replace('_', ' ')}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>

    </div>
  );
};