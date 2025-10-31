// 📁 frontend/src/servicios/api/estudiantesService.js
// ✅ Servicio API COMPLETO para estudiantes

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
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    },
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

// 👇 API tipo Axios con todos los métodos HTTP
const api = {
  get: async (path) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    const data = await fetchJson(url, { method: 'GET' });
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
  
  put: async (path, body) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    const data = await fetchJson(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    return { data };
  },
  
  delete: async (path) => {
    const cleanPath = path.replace(/^\/v1/, '');
    const url = `${ROOT}/api${cleanPath}`;
    const data = await fetchJson(url, { method: 'DELETE' });
    return { data };
  }
};

export default api;

// ============================================
// FUNCIONES HELPER PARA CADA ENDPOINT
// ============================================

// 📊 Perfil y Estadísticas
export const obtenerPerfilEstudiante = () => 
  api.get('/estudiantes/perfil').then(r => r.data);

export const obtenerEstadisticas = () => 
  api.get('/estudiantes/estadisticas').then(r => r.data);

export const actualizarPerfil = (datos) => 
  api.put('/estudiantes/perfil', datos).then(r => r.data);

// 📨 Postulaciones
export const obtenerMisPostulaciones = () => 
  api.get('/estudiantes/mis-postulaciones').then(r => r.data);

export const postularAOferta = (idOferta, cartaMotivacion) => 
  api.post(`/estudiantes/ofertas/${idOferta}/postular`, { carta_motivacion: cartaMotivacion })
    .then(r => r.data);

export const cancelarPostulacion = (idPostulacion) => 
  api.put(`/estudiantes/postulaciones/${idPostulacion}/cancelar`).then(r => r.data);

// 💼 Prácticas
export const obtenerMisPracticas = () => 
  api.get('/estudiantes/mis-practicas').then(r => r.data);

export const obtenerDetallePractica = (idPractica) => 
  api.get(`/estudiantes/practicas/${idPractica}`).then(r => r.data);

// 🔍 Ofertas
export const obtenerOfertasDisponibles = () => 
  api.get('/estudiantes/ofertas-disponibles').then(r => r.data);

// 📝 Informes
export const obtenerMisInformes = () => 
  api.get('/estudiantes/mis-informes').then(r => r.data);

export const subirInforme = (idPractica, formData) => {
  const cleanPath = `/estudiantes/practicas/${idPractica}/informes`;
  const url = `${ROOT}/api${cleanPath}`;
  
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    });
};

// 📔 Bitácora
export const obtenerBitacora = (idPractica) => 
  api.get(`/estudiantes/practicas/${idPractica}/bitacora`).then(r => r.data);

export const registrarActividadBitacora = (idPractica, datos) => 
  api.post(`/estudiantes/practicas/${idPractica}/bitacora`, datos).then(r => r.data);

export const actualizarActividadBitacora = (idPractica, idBitacora, datos) => 
  api.put(`/estudiantes/practicas/${idPractica}/bitacora/${idBitacora}`, datos).then(r => r.data);

export const eliminarActividadBitacora = (idPractica, idBitacora) => 
  api.delete(`/estudiantes/practicas/${idPractica}/bitacora/${idBitacora}`).then(r => r.data);

// 📋 Plan de Práctica
export const obtenerMiPlanPractica = () => 
  api.get('/estudiantes/mi-plan-practica').then(r => r.data);

// 📊 Evaluaciones
export const obtenerMisEvaluaciones = () => 
  api.get('/estudiantes/mis-evaluaciones').then(r => r.data);

// 🔔 Notificaciones
export const obtenerNotificaciones = () => 
  api.get('/estudiantes/notificaciones').then(r => r.data);

export const marcarNotificacionLeida = (idNotificacion) => 
  api.put(`/estudiantes/notificaciones/${idNotificacion}/leer`).then(r => r.data);

export const marcarTodasNotificacionesLeidas = () => 
  api.put('/estudiantes/notificaciones/leer-todas').then(r => r.data);