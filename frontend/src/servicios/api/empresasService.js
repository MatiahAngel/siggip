// 📁 UBICACIÓN: frontend/src/servicios/api/empresasService.js
// Servicio para manejar las peticiones API de empresas

import api from './cliente';

// Obtener todas las empresas
export const getEmpresas = async (params = {}) => {
  const response = await api.get('/empresas', { params });
  return response.data;
};

// Obtener una empresa por ID
export const getEmpresa = async (id) => {
  const response = await api.get(`/empresas/${id}`);
  return response.data;
};

// Crear nueva empresa
export const createEmpresa = async (data) => {
  const response = await api.post('/empresas', data);
  return response.data;
};

// Actualizar empresa
export const updateEmpresa = async (id, data) => {
  const response = await api.put(`/empresas/${id}`, data);
  return response.data;
};

// Eliminar empresa
export const deleteEmpresa = async (id) => {
  const response = await api.delete(`/empresas/${id}`);
  return response.data;
};

// Obtener estadísticas de empresas
export const getEstadisticasEmpresas = async () => {
  const response = await api.get('/empresas/estadisticas');
  return response.data;
};