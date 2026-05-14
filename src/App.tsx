import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewReception } from './pages/NewReception';
import { DetailOrder } from './pages/DetailOrder';
import { ServiceCatalog } from './pages/ServiceCatalog';
import { ProductCatalog } from './pages/ProductCatalog';
import { VehicleCatalog } from './pages/VehicleCatalog';
import { VehicleHistory } from './pages/VehicleHistory';
import { TeamManagement } from './pages/TeamManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nueva-recepcion" element={<NewReception />} />
        <Route path="/orden/:id" element={<DetailOrder />} />
        <Route path="/repair-services" element={<ServiceCatalog />} />
        <Route path="/products" element={<ProductCatalog/>} />
        <Route path="/vehicles" element={<VehicleCatalog/>} />
        <Route path="/vehicles/:id/history" element={<VehicleHistory/>} />
        <Route path="/team" element={<TeamManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;