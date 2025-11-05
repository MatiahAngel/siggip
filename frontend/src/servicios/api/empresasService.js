// 📁 UBICACIÓN: frontend/src/servicios/api/empresasService.js
// Servicio para manejar las peticiones API de empresas

import api from './cliente';

// Obtener todas las empresas
export const getEmpresas = async (params = {}) => {
  const response = await api.get('/empresas', { params });
  return response.data;
};

// Obtener la empresa asociada al usuario autenticado
export const getMiEmpresa = async () => {
  const { data } = await api.get('/empresas/mia');
  return data; // { id_empresa, nombre_comercial, ... }
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

// ==================== Postulaciones de la empresa ====================
// Listar postulaciones asociadas a las ofertas de la empresa autenticada
// Nota: el backend deduce la empresa desde el token (usuario -> usuarios_empresa -> id_empresa)
export const getPostulacionesEmpresa = async () => {
  const { data } = await api.get('/empresas/postulaciones');
  return Array.isArray(data) ? data : (data?.postulaciones || []);
};

// Aceptar una postulación: cambia estado y crea práctica vinculada en backend
export const aceptarPostulacionEmpresa = async (id_postulacion, comentarios = '') => {
  const { data } = await api.put(`/empresas/postulaciones/${id_postulacion}/aceptar`, { comentarios });
  return data;
};

// Rechazar una postulación con comentarios opcionales
export const rechazarPostulacionEmpresa = async (id_postulacion, comentarios = '') => {
  const { data } = await api.put(`/empresas/postulaciones/${id_postulacion}/rechazar`, { comentarios });
  return data;
};

// ==================== Practicantes de la empresa ====================
// Lista prácticas activas (asignadas o en curso) asociadas a las ofertas de la empresa
export const getPracticantesEmpresa = async () => {
  const { data } = await api.get('/empresas/practicantes');
  return Array.isArray(data) ? data : (data?.practicantes || []);
};