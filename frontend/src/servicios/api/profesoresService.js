// 📁 frontend/src/servicios/api/profesoresService.js
// ✅ Servicio para la gestión de profesores

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

async function fetchJson(url, options = {}) {
  console.log('📡 Llamando a:', url);
  
  const res = await fetch(url, { 
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
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
    // Limpiar /v1 del path porque tu backend usa /api/profesores (sin /v1)
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    
    const data = await fetchJson(url);
    return { data };
  },
  
  put: async (path, body) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    
    const data = await fetchJson(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    return { data };
  },
  
  post: async (path, body) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    
    const data = await fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return { data };
  },
  
  delete: async (path) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    
    const data = await fetchJson(url, {
      method: 'DELETE'
    });
    return { data };
  }
};

export default api;

// ==================== FUNCIONES HELPER ====================

/**
 * Obtener todos los profesores con paginación y filtros
 * @param {Object} params - { page, limit, busqueda, especialidad, estado }
 */
export const obtenerProfesores = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.busqueda) queryParams.append('busqueda', params.busqueda);
  if (params.especialidad) queryParams.append('especialidad', params.especialidad);
  if (params.estado) queryParams.append('estado', params.estado);
  
  const query = queryParams.toString();
  const path = query ? `/profesores?${query}` : '/profesores';
  
  return api.get(path).then(r => r.data);
};

/**
 * Obtener un profesor por ID
 * @param {number} id - ID del profesor
 */
export const obtenerProfesor = (id) => {
  return api.get(`/profesores/${id}`).then(r => r.data);
};

/**
 * Obtener estadísticas de profesores
 */
export const obtenerEstadisticas = () => {
  return api.get('/profesores/estadisticas').then(r => r.data);
};

/**
 * Actualizar información de un profesor
 * @param {number} id - ID del profesor
 * @param {Object} datos - Datos a actualizar
 */
export const actualizarProfesor = (id, datos) => {
  return api.put(`/profesores/${id}`, datos).then(r => r.data);
};