// 📁 UBICACIÓN: frontend/src/servicios/api/empresasService.js
// 🎯 PROPÓSITO: Servicio completo para gestionar empresas desde el frontend

import api from './cliente';

// ==================== CRUD Básico de Empresas ====================

/**
 * Obtener todas las empresas con filtros opcionales
 */
export const getEmpresas = async (params = {}) => {
  const response = await api.get('/empresas', { params });
  return response.data;
};

/**
 * Obtener la empresa asociada al usuario autenticado
 */
export const getMiEmpresa = async () => {
  const { data } = await api.get('/empresas/mia');
  return data;
};

/**
 * Obtener una empresa específica por ID
 */
export const getEmpresa = async (id) => {
  const response = await api.get(`/empresas/${id}`);
  return response.data;
};

/**
 * Crear nueva empresa
 */
export const createEmpresa = async (data) => {
  const response = await api.post('/empresas', data);
  return response.data;
};

/**
 * Actualizar datos de una empresa
 */
export const updateEmpresa = async (id, data) => {
  const response = await api.put(`/empresas/${id}`, data);
  return response.data;
};

/**
 * Eliminar empresa (soft delete - marca como inactiva)
 */
export const deleteEmpresa = async (id) => {
  const response = await api.delete(`/empresas/${id}`);
  return response.data;
};

/**
 * Obtener estadísticas generales de empresas
 */
export const getEstadisticasEmpresas = async () => {
  const response = await api.get('/empresas/estadisticas');
  return response.data;
};

// ==================== Gestión de Postulaciones ====================

/**
 * Listar postulaciones recibidas para las ofertas de la empresa autenticada
 */
export const getPostulacionesEmpresa = async () => {
  try {
    const { data } = await api.get('/empresas/postulaciones');
    return Array.isArray(data) ? data : (data?.postulaciones || []);
  } catch (error) {
    console.error('Error al obtener postulaciones de empresa:', error);
    return [];
  }
};

/**
 * Aceptar una postulación específica
 */
export const aceptarPostulacionEmpresa = async (id_postulacion, comentarios = '') => {
  const { data } = await api.put(
    `/empresas/postulaciones/${id_postulacion}/aceptar`,
    { comentarios }
  );
  return data;
};

/**
 * Rechazar una postulación específica
 */
export const rechazarPostulacionEmpresa = async (id_postulacion, comentarios = '') => {
  const { data } = await api.put(
    `/empresas/postulaciones/${id_postulacion}/rechazar`,
    { comentarios }
  );
  return data;
};

/**
 * Obtener detalles completos de un postulante específico
 */
export const getDetallePostulante = async (id_postulacion) => {
  const { data } = await api.get(`/empresas/postulaciones/${id_postulacion}/detalle`);
  return data;
};

// ==================== Gestión de Practicantes ====================

/**
 * Listar practicantes activos de la empresa
 */
export const getPracticantesEmpresa = async () => {
  try {
    const { data } = await api.get('/empresas/practicantes');
    return Array.isArray(data) ? data : (data?.practicantes || []);
  } catch (error) {
    console.error('Error al obtener practicantes de empresa:', error);
    return [];
  }
};

/**
 * Obtener el plan de práctica de un practicante
 */
export const getPlanPractica = async (id_practica) => {
  const { data } = await api.get(`/empresas/practicantes/${id_practica}/plan`);
  return data;
};

/**
 * Actualizar el plan de práctica (activar/desactivar áreas y tareas)
 */
export const actualizarPlanPractica = async (id_practica, planData) => {
  const { data } = await api.put(`/empresas/practicantes/${id_practica}/plan`, planData);
  return data;
};

// ==================== Gestión de Bitácora ====================

/**
 * Obtener bitácora de actividades del practicante
 */
export const getBitacoraPracticante = async (id_practica) => {
  const { data } = await api.get(`/empresas/practicantes/${id_practica}/bitacora`);
  return Array.isArray(data) ? data : (data?.actividades || []);
};

/**
 * Validar/aprobar una actividad de la bitácora
 */
export const validarActividadBitacora = async (id_actividad, validacion) => {
  const { data } = await api.put(`/empresas/bitacora/${id_actividad}/validar`, validacion);
  return data;
};

// ==================== Evaluaciones ====================

/**
 * Obtener evaluaciones del practicante
 */
export const getEvaluacionesPracticante = async (id_practica) => {
  const { data } = await api.get(`/empresas/practicantes/${id_practica}/evaluaciones`);
  return Array.isArray(data) ? data : (data?.evaluaciones || []);
};

/**
 * Crear una nueva evaluación para el practicante
 */
export const crearEvaluacion = async (id_practica, evaluacion) => {
  const { data } = await api.post(`/empresas/practicantes/${id_practica}/evaluaciones`, evaluacion);
  return data;
};

/**
 * Actualizar una evaluación existente
 */
export const actualizarEvaluacion = async (id_evaluacion, evaluacion) => {
  const { data } = await api.put(`/empresas/evaluaciones/${id_evaluacion}`, evaluacion);
  return data;
};

/**
 * Obtener detalle completo de una evaluación
 */
export const getDetalleEvaluacion = async (id_evaluacion) => {
  const { data } = await api.get(`/empresas/evaluaciones/${id_evaluacion}`);
  return data;
};