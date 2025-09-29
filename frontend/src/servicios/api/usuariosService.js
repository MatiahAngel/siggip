// 📁 UBICACIÓN: frontend/src/servicios/api/usuariosService.js
// Servicio para manejar las peticiones API de usuarios

import api from './cliente';

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const response = await api.get('/usuarios');
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

// Eliminar usuario
export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};