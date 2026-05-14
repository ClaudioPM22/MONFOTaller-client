// src/api/axiosClient.ts
import axios from 'axios';

// Creamos una instancia configurada de Axios
export const apiClient = axios.create({
  // Esta es la URL base de tu backend.
  // IMPORTANTE: Asegúrate de que el puerto sea el correcto (3000 o el que uses)
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE PETICIONES (El guardia de seguridad) ---
apiClient.interceptors.request.use(
  (config) => {
    // Buscamos el token en el almacenamiento del navegador (localStorage)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);