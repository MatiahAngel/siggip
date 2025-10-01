// 📁 frontend/src/servicios/api/usuariosService.js
// Servicio para manejar las peticiones API de usuarios

import api from './cliente';

// Obtener usuarios (por defecto solo activos; si pasas { estado: 'todos' } trae activos + inactivos)
export const getUsuarios = async (opts = {}) => {
  const params = {};
  if (opts.estado === 'todos') params.estado = 'todos';
  const response = await api.get('/usuarios', { params });
  return response.data;
};

// Obtener un usuario por ID
export const getUsuario = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

// Crear nuevo usuario
export const createUsuario = async (data) => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

// Actualizar usuario
export const updateUsuario = async (id, data) => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

// Eliminar usuario (soft delete: estado = 'inactivo')
export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};
