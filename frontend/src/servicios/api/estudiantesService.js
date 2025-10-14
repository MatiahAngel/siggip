// 📁 frontend/src/servicios/api/estudiantesService.js
// ✅ Corregido para funcionar con tu backend en /api/estudiantes

const ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
  // ⚠️ Evitar "Bearer null" o "Bearer undefined"
  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

async function fetchJson(url) {
  console.log('📡 Llamando a:', url);
  
  const res = await fetch(url, { 
    method: 'GET', 
    headers: getAuthHeaders(), 
    credentials: 'include' 
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('❌ Error:', res.status, text);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  
  const data = await res.json();
  console.log('✅ Respuesta:', data);
  return data;
}

// 👇 API tipo Axios con limpieza automática de /v1
const api = {
  get: async (path) => {
    // Limpiar /v1 del path porque tu backend usa /api/estudiantes (sin /v1)
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    
    const data = await fetchJson(url);
    return { data };
  },
};

export default api;

// Funciones helper opcionales
export const obtenerPerfilEstudiante   = () => api.get('/estudiantes/perfil').then(r => r.data);
export const obtenerEstadisticas       = () => api.get('/estudiantes/estadisticas').then(r => r.data);
export const obtenerMisPostulaciones   = () => api.get('/estudiantes/mis-postulaciones').then(r => r.data);
export const obtenerMisPracticas       = () => api.get('/estudiantes/mis-practicas').then(r => r.data);
export const obtenerOfertasDisponibles = () => api.get('/estudiantes/ofertas-disponibles').then(r => r.data);