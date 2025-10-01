// 📁 UBICACIÓN: backend/src/controladores/empresas/ctrl.js
// Controlador para gestionar empresas

import Empresa from '../../modelos/Empresa.js';
import { Op } from 'sequelize';
import { pool } from '../../configuracion/baseDatos.js';
import bcrypt from 'bcryptjs';

// Obtener todas las empresas
export const getAll = async (req, res) => {
  try {
    const { estado, search } = req.query;

    const whereClause = {};

    // mapear query ?estado= a columna real
    if (estado) {
      whereClause.estado_empresa = estado;
    }

    // Búsqueda por múltiples campos
    if (search) {
      const like = `%${search}%`;
      whereClause[Op.or] = [
        { razon_social:       { [Op.iLike]: like } },
        { nombre_comercial:   { [Op.iLike]: like } },
        { rut_empresa:        { [Op.iLike]: like } },
        { giro_comercial:     { [Op.iLike]: like } },
        { sector_economico:   { [Op.iLike]: like } },
        { contacto_principal: { [Op.iLike]: like } },
        { email_contacto:     { [Op.iLike]: like } },
        { comuna:             { [Op.iLike]: like } },
        { region:             { [Op.iLike]: like } },
      ];
    }

    const empresas = await Empresa.findAll({
      where: whereClause,
      order: [['fecha_creacion', 'DESC']],
    });

    return res.json(empresas);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

// Obtener una empresa por ID
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    return res.json(empresa);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return res.status(500).json({ error: 'Error al obtener empresa' });
  }
};

// Crear nueva empresa CON usuario asociado
export const create = async (req, res) => {
  try {
    const {
      rut_empresa,
      razon_social,
      nombre_comercial,
      giro_comercial,
      sector_economico,
      direccion,
      comuna,
      region,
      telefono,
      email_contacto,
      contacto_principal,
      cargo_contacto,
      fecha_convenio,
      estado_empresa,
      // Nuevos campos para crear usuario
      crear_usuario = true, // Por defecto crear usuario
      password_usuario,
    } = req.body;

    // Validaciones básicas
    if (!rut_empresa || !razon_social) {
      return res.status(400).json({ error: 'RUT y razón social son obligatorios' });
    }

    // Validar formato RUT
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
    if (!rutRegex.test(rut_empresa)) {
      return res.status(400).json({ error: 'Formato de RUT inválido. Use formato: 12345678-9' });
    }

    // Validar email si se proporciona
    if (email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
      return res.status(400).json({ error: 'Email de contacto inválido' });
    }

    // Verificar RUT único
    const existeRut = await Empresa.findOne({ where: { rut_empresa } });
    if (existeRut) {
      return res.status(400).json({ error: 'El RUT de empresa ya está registrado' });
    }

    // Si se va a crear usuario, validar email único
    if (crear_usuario && email_contacto) {
      const checkEmail = await pool.query(
        'SELECT id_usuario FROM siggip.usuarios WHERE email = $1',
        [email_contacto.toLowerCase()]
      );
      if (checkEmail.rows.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado como usuario' });
      }
    }

    // Crear empresa usando Sequelize
    const nuevaEmpresa = await Empresa.create({
      rut_empresa,
      razon_social,
      nombre_comercial,
      giro_comercial,
      sector_economico,
      direccion,
      comuna,
      region,
      telefono,
      email_contacto: email_contacto ? email_contacto.toLowerCase() : null,
      contacto_principal,
      cargo_contacto,
      fecha_convenio: fecha_convenio || null,
      estado_empresa: estado_empresa || 'activa',
    });

    // ✅ CREAR USUARIO DE EMPRESA Y VINCULARLO
    if (crear_usuario && email_contacto && contacto_principal) {
      try {
        // Generar contraseña por defecto si no se proporciona
        const password = password_usuario || 'Empresa123!'; // Cambiar por política de tu empresa
        const passwordHash = await bcrypt.hash(password, 10);

        // Dividir nombre del contacto en partes
        const nombreParts = contacto_principal.trim().split(' ');
        const nombre = nombreParts[0] || 'Empresa';
        const apellido_paterno = nombreParts[1] || razon_social.split(' ')[0];
        const apellido_materno = nombreParts[2] || '';

        // Crear usuario
        const insertUsuario = await pool.query(
          `INSERT INTO siggip.usuarios 
           (email, password_hash, nombre, apellido_paterno, apellido_materno, rut, tipo_usuario, estado) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING id_usuario`,
          [
            email_contacto.toLowerCase(),
            passwordHash,
            nombre,
            apellido_paterno,
            apellido_materno,
            rut_empresa, // Usar RUT de empresa como RUT del usuario
            'empresa',
            'activo'
          ]
        );

        const id_usuario = insertUsuario.rows[0].id_usuario;

        // Vincular usuario con empresa en usuarios_empresa
        await pool.query(
          `INSERT INTO siggip.usuarios_empresa 
           (id_usuario, id_empresa, cargo_usuario, es_contacto_principal) 
           VALUES ($1, $2, $3, $4)`,
          [
            id_usuario,
            nuevaEmpresa.id_empresa,
            cargo_contacto || 'Representante Legal',
            true
          ]
        );

        console.log(`✅ Usuario creado y vinculado a empresa ${razon_social}`);
      } catch (errorUsuario) {
        console.error('Error al crear usuario de empresa:', errorUsuario);
        // No fallar la creación de empresa si falla el usuario
        // Solo registrar el error
      }
    }

    return res.status(201).json({
      ...nuevaEmpresa.toJSON(),
      usuario_creado: crear_usuario && email_contacto && contacto_principal
    });
  } catch (error) {
    console.error('Error al crear empresa:', error);
    return res.status(500).json({ error: 'Error al crear empresa' });
  }
};

// Actualizar empresa
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rut_empresa,
      razon_social,
      nombre_comercial,
      giro_comercial,
      sector_economico,
      direccion,
      comuna,
      region,
      telefono,
      email_contacto,
      contacto_principal,
      cargo_contacto,
      fecha_convenio,
      estado_empresa,
    } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    // Validar RUT si cambió
    if (rut_empresa && rut_empresa !== empresa.rut_empresa) {
      const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
      if (!rutRegex.test(rut_empresa)) {
        return res.status(400).json({ error: 'Formato de RUT inválido. Use formato: 12345678-9' });
      }
      const existeRut = await Empresa.findOne({ where: { rut_empresa } });
      if (existeRut && existeRut.id_empresa !== parseInt(id, 10)) {
        return res.status(400).json({ error: 'El RUT ya está en uso' });
      }
    }

    // Validar email si cambió
    if (email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
      return res.status(400).json({ error: 'Email de contacto inválido' });
    }

    await empresa.update({
      rut_empresa:          rut_empresa          ?? empresa.rut_empresa,
      razon_social:         razon_social         ?? empresa.razon_social,
      nombre_comercial:     nombre_comercial     ?? empresa.nombre_comercial,
      giro_comercial:       giro_comercial       ?? empresa.giro_comercial,
      sector_economico:     sector_economico     ?? empresa.sector_economico,
      direccion:            direccion            ?? empresa.direccion,
      comuna:               comuna               ?? empresa.comuna,
      region:               region               ?? empresa.region,
      telefono:             telefono             ?? empresa.telefono,
      email_contacto:       email_contacto ? email_contacto.toLowerCase() : empresa.email_contacto,
      contacto_principal:   contacto_principal   ?? empresa.contacto_principal,
      cargo_contacto:       cargo_contacto       ?? empresa.cargo_contacto,
      fecha_convenio:       fecha_convenio       ?? empresa.fecha_convenio,
      estado_empresa:       estado_empresa       ?? empresa.estado_empresa,
    });

    return res.json(empresa);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    return res.status(500).json({ error: 'Error al actualizar empresa' });
  }
};

// Eliminar empresa (soft delete: inactiva)
export const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.update({ estado_empresa: 'inactiva' });

    // También desactivar usuarios asociados
    await pool.query(
      `UPDATE siggip.usuarios 
       SET estado = 'inactivo' 
       WHERE id_usuario IN (
         SELECT id_usuario FROM siggip.usuarios_empresa WHERE id_empresa = $1
       )`,
      [id]
    );

    return res.json({ message: 'Empresa desactivada correctamente' });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    return res.status(500).json({ error: 'Error al eliminar empresa' });
  }
};

// Obtener estadísticas de empresas
export const getEstadisticas = async (_req, res) => {
  try {
    const total     = await Empresa.count();
    const activas   = await Empresa.count({ where: { estado_empresa: 'activa' } });
    const inactivas = await Empresa.count({ where: { estado_empresa: 'inactiva' } });

    return res.json({ total, activas, inactivas });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};