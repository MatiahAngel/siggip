// 📁 UBICACIÓN: frontend/src/servicios/api/profesoresService.js
// ✅ Servicio completo para la gestión de profesores

const ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
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

const api = {
  get: async (path) => {
    const url = `${ROOT}/api${path}`;
    const data = await fetchJson(url);
    return { data };
  },
  
  put: async (path, body) => {
    const url = `${ROOT}/api${path}`;
    const data = await fetchJson(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    return { data };
  },
  
  post: async (path, body) => {
    const url = `${ROOT}/api${path}`;
    const data = await fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return { data };
  },
  
  delete: async (path) => {
    const url = `${ROOT}/api${path}`;
    const data = await fetchJson(url, {
      method: 'DELETE'
    });
    return { data };
  }
};

export default api;

// ==================== FUNCIONES HELPER ====================

/**
 * Obtener perfil del profesor autenticado
 */
export const obtenerPerfilProfesor = () => {
  return api.get('/profesores/perfil').then(r => r.data);
};

/**
 * Obtener estadísticas del profesor autenticado
 */
export const obtenerEstadisticasProfesor = () => {
  return api.get('/profesores/estadisticas-profesor').then(r => r.data);
};

/**
 * Obtener lista de estudiantes asignados al profesor
 */
export const obtenerMisEstudiantes = () => {
  return api.get('/profesores/mis-estudiantes').then(r => r.data);
};

/**
 * Obtener bitácora de un estudiante
 * @param {number} id_practica - ID de la práctica
 */
export const obtenerBitacoraEstudiante = (id_practica) => {
  return api.get(`/profesores/estudiante/${id_practica}/bitacora`).then(r => r.data);
};

/**
 * Obtener informes de un estudiante
 * @param {number} id_practica - ID de la práctica
 */
export const obtenerInformesEstudiante = (id_practica) => {
  return api.get(`/profesores/estudiante/${id_practica}/informes`).then(r => r.data);
};

/**
 * Obtener evaluación completa de una práctica
 * @param {number} id_practica - ID de la práctica
 */
export const obtenerEvaluacionCompleta = (id_practica) => {
  return api.get(`/profesores/evaluacion/${id_practica}`).then(r => r.data);
};

/**
 * Certificar evaluación de una práctica
 * @param {number} id_practica - ID de la práctica
 * @param {Object} datos - { calificacion_profesor, comentarios_profesor, aprobar }
 */
export const certificarEvaluacion = (id_practica, datos) => {
  return api.post(`/profesores/evaluacion/${id_practica}/certificar`, datos).then(r => r.data);
};

/**
 * Obtener todos los profesores (ADMIN)
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
 * Obtener un profesor por ID (ADMIN)
 * @param {number} id - ID del profesor
 */
export const obtenerProfesor = (id) => {
  return api.get(`/profesores/${id}`).then(r => r.data);
};

/**
 * Obtener estadísticas generales (ADMIN)
 */
export const obtenerEstadisticas = () => {
  return api.get('/profesores/estadisticas').then(r => r.data);
};

/**
 * Actualizar información de un profesor (ADMIN)
 * @param {number} id - ID del profesor
 * @param {Object} datos - Datos a actualizar
 */
export const actualizarProfesor = (id, datos) => {
  return api.put(`/profesores/${id}`, datos).then(r => r.data);
};