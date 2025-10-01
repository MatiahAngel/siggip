// 📁 frontend/src/servicios/api/dashboardService.js
// Servicio de Dashboard (stats, top empresas, auditoría)

import api from './cliente'; // ajusta si tu apiClient vive en otra ruta

// GET /dashboard/stats
// -> { totalUsuarios, totalEmpresas, totalPracticas, practicasActivas, variaciones? }
export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

// GET /dashboard/top-empresas?limit=5
// -> [{ nombre, practicantes, rating }]
export const getTopEmpresas = async (params = {}) => {
  const { data } = await api.get('/dashboard/top-empresas', { params });
  return data;
};

// GET /auditoria/logs?limit=10
// -> [{ id_log, usuario_nombre, accion, entidad, descripcion, ip, created_at }]
export const getAuditoriaReciente = async (params = {}) => {
  const { data } = await api.get('/auditoria/logs', { params });
  return data;
};
