// 📁 UBICACIÓN: frontend/src/servicios/api/ofertasService.js
// 🎯 Servicio para gestionar ofertas de práctica

import cliente from './cliente';

// 📋 Obtener todas las ofertas
export const getOfertas = async () => {
  try {
    const response = await cliente.get('/ofertas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    throw error;
  }
};

// 🔍 Obtener una oferta por ID
export const getOfertaById = async (id) => {
  try {
    const response = await cliente.get(`/ofertas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener oferta:', error);
    throw error;
  }
};

// ➕ Crear nueva oferta
export const createOferta = async (ofertaData) => {
  try {
    const response = await cliente.post('/ofertas', ofertaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear oferta:', error);
    throw error;
  }
};

// ✏️ Actualizar oferta
export const updateOferta = async (id, ofertaData) => {
  try {
    const response = await cliente.put(`/ofertas/${id}`, ofertaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar oferta:', error);
    throw error;
  }
};

// 🗑️ Eliminar oferta
export const deleteOferta = async (id) => {
  try {
    const response = await cliente.delete(`/ofertas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    throw error;
  }
};

// 📊 Obtener estadísticas de ofertas
export const getEstadisticas = async () => {
  try {
    const response = await cliente.get('/ofertas/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// 🏢 Obtener ofertas por empresa
export const getOfertasByEmpresa = async (idEmpresa) => {
  try {
    const response = await cliente.get(`/ofertas/empresa/${idEmpresa}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas por empresa:', error);
    throw error;
  }
};

// 🏫 Obtener todas las empresas para el select
export const getEmpresas = async () => {
  try {
    const response = await cliente.get('/empresas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
};

// 📚 Obtener todas las especialidades para el select
export const getEspecialidades = async () => {
  try {
    const response = await cliente.get('/especialidades');
    return response.data;
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    throw error;
  }
};