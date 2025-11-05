// 📁 UBICACIÓN: backend/src/controladores/empresas/ctrl.js
// Controlador para gestionar empresas

import Empresa from '../../modelos/Empresa.js';
import { Op } from 'sequelize';
import { pool, sequelize } from '../../configuracion/baseDatos.js';
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

// ==================== Postulaciones de Empresa ====================
// Obtiene el id_empresa asociado al usuario autenticado
async function getIdEmpresaFromUsuario(id_usuario) {
  // 1) Intento directo por tabla de mapeo usuarios_empresa
  const direct = await pool.query(
    `SELECT id_empresa
     FROM siggip.usuarios_empresa
     WHERE id_usuario = $1
     ORDER BY es_contacto_principal DESC
     LIMIT 1`,
    [id_usuario]
  );
  if (direct.rows.length > 0) return direct.rows[0].id_empresa;

  // 2) Fallback: buscar email y rut del usuario
  const ures = await pool.query(
    `SELECT email, rut
     FROM siggip.usuarios
     WHERE id_usuario = $1
     LIMIT 1`,
    [id_usuario]
  );
  if (ures.rows.length === 0) return null;
  const { email, rut } = ures.rows[0];

  // 3) Fallback por email de contacto de la empresa
  if (email) {
    const e1 = await pool.query(
      `SELECT id_empresa
       FROM siggip.empresas
       WHERE LOWER(email_contacto) = LOWER($1)
       LIMIT 1`,
      [email]
    );
    if (e1.rows.length > 0) return e1.rows[0].id_empresa;
  }

  // 4) Fallback por RUT de empresa = RUT del usuario
  if (rut) {
    const e2 = await pool.query(
      `SELECT id_empresa
       FROM siggip.empresas
       WHERE rut_empresa = $1
       LIMIT 1`,
      [rut]
    );
    if (e2.rows.length > 0) return e2.rows[0].id_empresa;
  }

  return null;
}

// Listar postulaciones recibidas para las ofertas de la empresa
export const listarPostulacionesEmpresa = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const query = `
      SELECT 
        p.id_postulacion,
        p.estado_postulacion,
        p.fecha_postulacion,
        p.carta_motivacion,
        o.id_oferta,
        o.titulo_oferta,
        o.duracion_horas,
        u.nombre AS estudiante_nombre,
        esp.nombre_especialidad AS especialidad
      FROM siggip.postulaciones p
      JOIN siggip.ofertas_practica o ON o.id_oferta = p.id_oferta
      JOIN siggip.estudiantes est ON est.id_estudiante = p.id_estudiante
      JOIN siggip.usuarios u ON u.id_usuario = est.id_usuario
      JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
      WHERE o.id_empresa = :id_empresa
        AND p.estado_postulacion IN ('pendiente','en_revision')
      ORDER BY p.fecha_postulacion DESC`;

    const resultado = await sequelize.query(query, {
      replacements: { id_empresa },
      type: sequelize.QueryTypes.SELECT
    });
    return res.json(resultado);
  } catch (error) {
    console.error('Error al listar postulaciones de empresa:', error);
    return res.status(500).json({ error: 'Error al listar postulaciones' });
  }
};

// Aceptar una postulación: marca aceptada y crea la práctica en una transacción
export const aceptarPostulacionEmpresa = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_postulacion } = req.params;
    const { comentarios = '' } = req.body || {};

    // Validar pertenencia, estado y cupos
    const sel = await sequelize.query(
      `SELECT p.id_postulacion, p.id_estudiante, p.id_oferta, p.estado_postulacion,
              o.id_empresa, o.fecha_inicio, o.cupos_disponibles
       FROM siggip.postulaciones p
       JOIN siggip.ofertas_practica o ON o.id_oferta = p.id_oferta
       WHERE p.id_postulacion = :id_postulacion`,
      { replacements: { id_postulacion }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (sel.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Postulación no encontrada' });
    }

    const post = sel[0];
    if (post.id_empresa !== id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'No autorizado para gestionar esta postulación' });
    }
    if (!['pendiente', 'en_revision'].includes(post.estado_postulacion)) {
      await t.rollback();
      return res.status(400).json({ error: 'La postulación no está en un estado válido para aceptar' });
    }
    if (Number(post.cupos_disponibles) <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Sin cupos disponibles para la oferta' });
    }

    // Marcar postulación como aceptada
    await sequelize.query(
      `UPDATE siggip.postulaciones
       SET estado_postulacion = 'aceptada', fecha_respuesta = CURRENT_TIMESTAMP, comentarios_seleccion = :comentarios
       WHERE id_postulacion = :id_postulacion`,
      { replacements: { id_postulacion, comentarios }, type: sequelize.QueryTypes.UPDATE, transaction: t }
    );

    // Crear práctica asociada
    await sequelize.query(
      `INSERT INTO siggip.practicas (
        id_estudiante, id_oferta, fecha_inicio_practica, fecha_asignacion, estado_practica, horas_completadas
      ) VALUES (
        :id_estudiante, :id_oferta, :fecha_inicio, CURRENT_TIMESTAMP, 'asignada', 0
      )`,
      { replacements: { id_estudiante: post.id_estudiante, id_oferta: post.id_oferta, fecha_inicio: post.fecha_inicio }, type: sequelize.QueryTypes.INSERT, transaction: t }
    );

    // Decrementar cupos de la oferta
    await sequelize.query(
      `UPDATE siggip.ofertas_practica SET cupos_disponibles = cupos_disponibles - 1 WHERE id_oferta = :id_oferta`,
      { replacements: { id_oferta: post.id_oferta }, type: sequelize.QueryTypes.UPDATE, transaction: t }
    );

    await t.commit();
    return res.json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error('Error al aceptar postulación:', error);
    return res.status(400).json({ error: error.message || 'No fue posible aceptar la postulación' });
  }
};

// Rechazar una postulación
export const rechazarPostulacionEmpresa = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_postulacion } = req.params;
    const { comentarios = '' } = req.body || {};

    const result = await sequelize.query(
      `UPDATE siggip.postulaciones p
       SET estado_postulacion = 'rechazada', fecha_respuesta = CURRENT_TIMESTAMP, comentarios_seleccion = :comentarios
       FROM siggip.ofertas_practica o
       WHERE p.id_postulacion = :id_postulacion
         AND p.id_oferta = o.id_oferta
         AND o.id_empresa = :id_empresa
         AND p.estado_postulacion IN ('pendiente','en_revision')`,
      { replacements: { id_postulacion, id_empresa, comentarios }, type: sequelize.QueryTypes.UPDATE }
    );

    // sequelize.query con UPDATE retorna [affectedCount]
    const affected = Array.isArray(result) ? result[1] ?? result[0] : result;
    if (!affected) {
      return res.status(400).json({ error: 'Postulación no encontrada o estado inválido' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error al rechazar postulación:', error);
    return res.status(400).json({ error: error.message || 'No fue posible rechazar la postulación' });
  }
};

// Listar practicantes activos de la empresa (prácticas creadas por aceptación)
export const listarPracticantesEmpresa = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const query = `
      SELECT 
        pr.id_practica,
        pr.fecha_inicio_practica AS fecha_inicio,
        pr.horas_completadas,
        pr.estado_practica,
        of.id_oferta,
        of.titulo_oferta,
        of.duracion_horas AS horas_requeridas,
        u.nombre AS estudiante_nombre
      FROM siggip.practicas pr
      JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
      JOIN siggip.estudiantes e ON e.id_estudiante = pr.id_estudiante
      JOIN siggip.usuarios u ON u.id_usuario = e.id_usuario
      WHERE of.id_empresa = :id_empresa
        AND pr.estado_practica IN ('asignada','en_curso')
      ORDER BY pr.fecha_asignacion DESC`;

    const resultado = await sequelize.query(query, {
      replacements: { id_empresa },
      type: sequelize.QueryTypes.SELECT
    });

    // Se puede calcular el progreso en el frontend; devolvemos datos crudos
    return res.json(resultado);
  } catch (error) {
    console.error('Error al listar practicantes de empresa:', error);
    return res.status(500).json({ error: 'Error al listar practicantes' });
  }
};

// Obtener la empresa asociada al usuario autenticado (según token)
export const getMiEmpresa = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    if (!id_usuario) return res.status(401).json({ error: 'No autenticado' });

    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(404).json({ error: 'Usuario no asociado a ninguna empresa' });

    const empresa = await Empresa.findByPk(id_empresa);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    return res.json(empresa);
  } catch (error) {
    console.error('Error al obtener empresa del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener empresa del usuario' });
  }
};