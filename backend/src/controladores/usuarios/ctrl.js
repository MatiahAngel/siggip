// 📁 UBICACIÓN: backend/src/controladores/usuarios/ctrl.js
// Controlador para gestionar usuarios

import bcrypt from 'bcryptjs';
import Usuario from '../../modelos/Usuario.js';

// Obtener todos los usuarios
export const getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['id_usuario', 'DESC']],
    });

    return res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Crear nuevo usuario
export const create = async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      rut,
      telefono,
      tipo_usuario,
      password,
    } = req.body;

    // Validaciones
    if (!nombre || !apellido_paterno || !email || !rut || !tipo_usuario || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar que password tenga al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el email no exista
    const existeEmail = await Usuario.findOne({ where: { email: email.toLowerCase() } });
    if (existeEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Verificar que el RUT no exista
    const existeRut = await Usuario.findOne({ where: { rut } });
    if (existeRut) {
      return res.status(400).json({ error: 'El RUT ya está registrado' });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      email: email.toLowerCase(),
      rut,
      telefono,
      tipo_usuario,
      password_hash,
      estado: 'activo',
    });

    // Retornar sin el password_hash
    const usuarioResponse = nuevoUsuario.toJSON();
    delete usuarioResponse.password_hash;

    return res.status(201).json(usuarioResponse);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      rut,
      telefono,
      tipo_usuario,
      password,
    } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar email si cambió
    if (email && email !== usuario.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      const existeEmail = await Usuario.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existeEmail && existeEmail.id_usuario !== parseInt(id)) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
    }

    // Validar RUT si cambió
    if (rut && rut !== usuario.rut) {
      const existeRut = await Usuario.findOne({ where: { rut } });
      if (existeRut && existeRut.id_usuario !== parseInt(id)) {
        return res.status(400).json({ error: 'El RUT ya está en uso' });
      }
    }

    // Preparar datos a actualizar
    const datosActualizar = {
      nombre: nombre || usuario.nombre,
      apellido_paterno: apellido_paterno || usuario.apellido_paterno,
      apellido_materno: apellido_materno || usuario.apellido_materno,
      email: email ? email.toLowerCase() : usuario.email,
      rut: rut || usuario.rut,
      telefono: telefono || usuario.telefono,
      tipo_usuario: tipo_usuario || usuario.tipo_usuario,
    };

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      datosActualizar.password_hash = await bcrypt.hash(password, 10);
    }

    // Actualizar
    await usuario.update(datosActualizar);

    // Retornar sin el password_hash
    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.password_hash;

    return res.json(usuarioResponse);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Opción 1: Eliminar físicamente (comentar si prefieres desactivar)
    await usuario.destroy();

    // Opción 2: Desactivar en lugar de eliminar (descomentar si prefieres)
    // await usuario.update({ estado: 'inactivo' });

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};