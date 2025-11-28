// 📁 UBICACIÓN: backend/src/controladores/empresas/ctrl.js
// ✅ VERSIÓN CORREGIDA CON:
// - id_estudiante e id_profesor_guia en evaluaciones_finales
// - estado_evaluacion actualizado correctamente a 'completada'
// - Todos los fixes aplicados

import Empresa from '../../modelos/Empresa.js';
import { Op } from 'sequelize';
import { pool, sequelize } from '../../configuracion/baseDatos.js';
import bcrypt from 'bcryptjs';

// ============================================================================
// 🔧 FUNCIÓN HELPER PARA MAPEAR NIVEL DE LOGRO
// ============================================================================
const mapearNivelLogro = (nivelFrontend) => {
  const mapeo = {
    'excelente': 'E',
    'bueno': 'B',
    'suficiente': 'S',
    'insuficiente': 'I',
    'E': 'E',
    'B': 'B',
    'S': 'S',
    'I': 'I'
  };
  
  const nivel = (nivelFrontend || '').toLowerCase();
  return mapeo[nivel] || null;
};

// Obtener todas las empresas
export const getAll = async (req, res) => {
  try {
    const { estado, search } = req.query;

    const whereClause = {};

    if (estado) {
      whereClause.estado_empresa = estado;
    }

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
      crear_usuario = true,
      password_usuario,
    } = req.body;

    if (!rut_empresa || !razon_social) {
      return res.status(400).json({ error: 'RUT y razón social son obligatorios' });
    }

    const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
    if (!rutRegex.test(rut_empresa)) {
      return res.status(400).json({ error: 'Formato de RUT inválido. Use formato: 12345678-9' });
    }

    if (email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
      return res.status(400).json({ error: 'Email de contacto inválido' });
    }

    const existeRut = await Empresa.findOne({ where: { rut_empresa } });
    if (existeRut) {
      return res.status(400).json({ error: 'El RUT de empresa ya está registrado' });
    }

    if (crear_usuario && email_contacto) {
      const checkEmail = await pool.query(
        'SELECT id_usuario FROM siggip.usuarios WHERE email = $1',
        [email_contacto.toLowerCase()]
      );
      if (checkEmail.rows.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado como usuario' });
      }
    }

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

    if (crear_usuario && email_contacto && contacto_principal) {
      try {
        const password = password_usuario || 'Empresa123!';
        const passwordHash = await bcrypt.hash(password, 10);

        const nombreParts = contacto_principal.trim().split(' ');
        const nombre = nombreParts[0] || 'Empresa';
        const apellido_paterno = nombreParts[1] || razon_social.split(' ')[0];
        const apellido_materno = nombreParts[2] || '';

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
            rut_empresa,
            'empresa',
            'activo'
          ]
        );

        const id_usuario = insertUsuario.rows[0].id_usuario;

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

// ==================== Función Helper ====================
async function getIdEmpresaFromUsuario(id_usuario) {
  const direct = await pool.query(
    `SELECT id_empresa
     FROM siggip.usuarios_empresa
     WHERE id_usuario = $1
     ORDER BY es_contacto_principal DESC
     LIMIT 1`,
    [id_usuario]
  );
  if (direct.rows.length > 0) return direct.rows[0].id_empresa;

  const ures = await pool.query(
    `SELECT email, rut
     FROM siggip.usuarios
     WHERE id_usuario = $1
     LIMIT 1`,
    [id_usuario]
  );
  if (ures.rows.length === 0) return null;
  const { email, rut } = ures.rows[0];

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

// ==================== Postulaciones ====================

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

export const getDetallePostulante = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_postulacion } = req.params;

    const query = `
      SELECT 
        p.id_postulacion,
        p.estado_postulacion,
        p.fecha_postulacion,
        p.carta_motivacion,
        p.comentarios_seleccion,
        o.id_oferta,
        o.titulo_oferta,
        o.duracion_horas,
        o.descripcion_oferta,
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.rut,
        est.id_estudiante,
        est.telefono,
        est.direccion,
        est.fecha_nacimiento,
        esp.id_especialidad,
        esp.nombre_especialidad AS especialidad,
        esp.codigo_especialidad
      FROM siggip.postulaciones p
      JOIN siggip.ofertas_practica o ON o.id_oferta = p.id_oferta
      JOIN siggip.estudiantes est ON est.id_estudiante = p.id_estudiante
      JOIN siggip.usuarios u ON u.id_usuario = est.id_usuario
      JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
      WHERE p.id_postulacion = :id_postulacion
        AND o.id_empresa = :id_empresa`;

    const resultado = await sequelize.query(query, {
      replacements: { id_postulacion, id_empresa },
      type: sequelize.QueryTypes.SELECT
    });

    if (resultado.length === 0) {
      return res.status(404).json({ error: 'Postulación no encontrada' });
    }

    return res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener detalle del postulante:', error);
    return res.status(500).json({ error: 'Error al obtener detalle del postulante' });
  }
};

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

    await sequelize.query(
      `UPDATE siggip.postulaciones
       SET estado_postulacion = 'aceptada', fecha_respuesta = CURRENT_TIMESTAMP, comentarios_seleccion = :comentarios
       WHERE id_postulacion = :id_postulacion`,
      { replacements: { id_postulacion, comentarios }, type: sequelize.QueryTypes.UPDATE, transaction: t }
    );

    await sequelize.query(
      `INSERT INTO siggip.practicas (
        id_estudiante, id_oferta, fecha_inicio_practica, fecha_asignacion, estado_practica, horas_completadas
      ) VALUES (
        :id_estudiante, :id_oferta, :fecha_inicio, CURRENT_TIMESTAMP, 'asignada', 0
      )`,
      { replacements: { id_estudiante: post.id_estudiante, id_oferta: post.id_oferta, fecha_inicio: post.fecha_inicio }, type: sequelize.QueryTypes.INSERT, transaction: t }
    );

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

// ==================== Practicantes ====================

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
        u.nombre AS estudiante_nombre,
        u.apellido_paterno,
        u.apellido_materno,
        esp.nombre_especialidad,
        esp.codigo_especialidad
      FROM siggip.practicas pr
      JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
      JOIN siggip.estudiantes e ON e.id_estudiante = pr.id_estudiante
      JOIN siggip.usuarios u ON u.id_usuario = e.id_usuario
      JOIN siggip.especialidades esp ON esp.id_especialidad = e.id_especialidad
      WHERE of.id_empresa = :id_empresa
        AND pr.estado_practica IN ('asignada','en_curso')
      ORDER BY pr.fecha_asignacion DESC`;

    const resultado = await sequelize.query(query, {
      replacements: { id_empresa },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(resultado);
  } catch (error) {
    console.error('Error al listar practicantes de empresa:', error);
    return res.status(500).json({ error: 'Error al listar practicantes' });
  }
};

export const getPlanPractica = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const query = `
      SELECT 
        pp.id_plan_practica,
        pp.id_practica,
        pp.fecha_creacion AS fecha_creacion_plan,
        pp.maestro_guia_nombre,
        pp.maestro_guia_rut,
        pp.maestro_guia_cargo,
        pp.maestro_guia_email,
        pp.maestro_guia_telefono,
        pr.id_estudiante,
        pr.id_oferta,
        esp.id_especialidad,
        esp.nombre_especialidad
      FROM siggip.planes_practica pp
      JOIN siggip.practicas pr ON pr.id_practica = pp.id_practica
      JOIN siggip.estudiantes est ON est.id_estudiante = pr.id_estudiante
      JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
      WHERE pp.id_practica = :id_practica`;

    const plan = await sequelize.query(query, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    if (plan.length === 0) {
      return res.status(404).json({ error: 'Plan de práctica no encontrado' });
    }

    const areas = await sequelize.query(
      `SELECT 
        ppa.id_plan_area,
        ppa.activa AS area_activa,
        ac.id_area_competencia,
        ac.nombre_area,
        ac.descripcion_area
       FROM siggip.plan_practica_areas ppa
       JOIN siggip.areas_competencia ac ON ac.id_area_competencia = ppa.id_area_competencia
       WHERE ppa.id_plan_practica = :id_plan_practica
       ORDER BY ac.nombre_area`,
      { replacements: { id_plan_practica: plan[0].id_plan_practica }, type: sequelize.QueryTypes.SELECT }
    );

    for (let area of areas) {
      const tareas = await sequelize.query(
        `SELECT 
          ppt.id_plan_tarea,
          ppt.activa AS tarea_activa,
          ppt.completada,
          ppt.fecha_completado,
          t.id_tarea_competencia,
          t.descripcion_tarea,
          t.horas_estimadas
         FROM siggip.plan_practica_tareas ppt
         JOIN siggip.tareas_competencia t ON t.id_tarea_competencia = ppt.id_tarea_competencia
         WHERE ppt.id_plan_area = :id_plan_area
         ORDER BY t.descripcion_tarea`,
        { replacements: { id_plan_area: area.id_plan_area }, type: sequelize.QueryTypes.SELECT }
      );
      area.tareas = tareas;
    }

    return res.json({
      ...plan[0],
      areas
    });
  } catch (error) {
    console.error('Error al obtener plan de práctica:', error);
    return res.status(500).json({ error: 'Error al obtener plan de práctica' });
  }
};

export const actualizarPlanPractica = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_practica } = req.params;
    const { areas } = req.body;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    if (areas && Array.isArray(areas)) {
      for (let area of areas) {
        if (area.id_plan_area) {
          await sequelize.query(
            `UPDATE siggip.plan_practica_areas SET activa = :activa WHERE id_plan_area = :id_plan_area`,
            { replacements: { id_plan_area: area.id_plan_area, activa: area.activa }, type: sequelize.QueryTypes.UPDATE, transaction: t }
          );

          if (area.tareas && Array.isArray(area.tareas)) {
            for (let tarea of area.tareas) {
              if (tarea.id_plan_tarea) {
                await sequelize.query(
                  `UPDATE siggip.plan_practica_tareas SET activa = :activa WHERE id_plan_tarea = :id_plan_tarea`,
                  { replacements: { id_plan_tarea: tarea.id_plan_tarea, activa: tarea.activa }, type: sequelize.QueryTypes.UPDATE, transaction: t }
                );
              }
            }
          }
        }
      }
    }

    await t.commit();
    return res.json({ success: true, message: 'Plan de práctica actualizado' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar plan de práctica:', error);
    return res.status(500).json({ error: 'Error al actualizar plan de práctica' });
  }
};

export const getBitacoraPracticante = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const query = `
      SELECT 
        ba.id_bitacora as id_actividad_bitacora,
        ba.fecha_actividad,
        ba.descripcion_actividad,
        ba.duracion_horas as horas_dedicadas,
        ba.equipos_utilizados,
        ba.herramientas_utilizadas,
        ba.normas_seguridad_aplicadas,
        ba.observaciones,
        ba.validado_por_empresa as validada_empresa,
        '' as comentarios_empresa,
        NULL as fecha_validacion_empresa,
        ba.duracion_horas as horas_validadas,
        ba.fecha_registro,
        '' as aprendizajes_logrados,
        '' as dificultades_encontradas,
        CASE 
          WHEN ba.validado_por_empresa = true THEN 'validada'
          WHEN ba.validado_por_empresa = false THEN 'pendiente'
          ELSE 'pendiente'
        END as estado_actividad
      FROM siggip.bitacora_actividades ba
      WHERE ba.id_practica = :id_practica
      ORDER BY ba.fecha_actividad DESC, ba.fecha_registro DESC`;

    const actividades = await sequelize.query(query, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Bitácora cargada: ${actividades.length} actividades`);

    return res.json(actividades);
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    return res.status(500).json({ error: 'Error al obtener bitácora' });
  }
};

export const validarActividadBitacora = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_actividad } = req.params;
    const { aprobada, comentarios = '', horas_validadas } = req.body;

    const verificacion = await sequelize.query(
      `SELECT ba.id_bitacora, ba.id_practica, ba.duracion_horas
       FROM siggip.bitacora_actividades ba
       JOIN siggip.practicas pr ON pr.id_practica = ba.id_practica
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE ba.id_bitacora = :id_actividad AND o.id_empresa = :id_empresa`,
      { replacements: { id_actividad, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada o no autorizada' });
    }

    const actividad = verificacion[0];
    const horasValidas = Math.round(horas_validadas ?? actividad.duracion_horas);

    await sequelize.query(
      `UPDATE siggip.bitacora_actividades
       SET validado_por_empresa = :aprobada,
           observaciones = COALESCE(:comentarios, observaciones)
       WHERE id_bitacora = :id_actividad`,
      {
        replacements: {
          id_actividad,
          aprobada,
          comentarios
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (aprobada) {
      await sequelize.query(
        `UPDATE siggip.practicas
         SET horas_completadas = horas_completadas + :horas::integer
         WHERE id_practica = :id_practica`,
        {
          replacements: { id_practica: actividad.id_practica, horas: horasValidas },
          type: sequelize.QueryTypes.UPDATE
        }
      );
    }

    return res.json({ success: true, message: 'Actividad validada correctamente' });
  } catch (error) {
    console.error('Error al validar actividad:', error);
    return res.status(500).json({ error: 'Error al validar actividad' });
  }
};

// ==================== Evaluaciones (SISTEMA ANTIGUO) ====================

export const getEvaluacionesPracticante = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const query = `
      SELECT 
        e.id_evaluacion,
        e.tipo_evaluacion,
        e.fecha_evaluacion,
        e.periodo_evaluacion,
        e.nota_final,
        e.observaciones_generales,
        e.fortalezas_destacadas,
        e.areas_mejora,
        e.estado_evaluacion,
        e.evaluador_nombre,
        e.evaluador_cargo,
        e.fecha_registro
      FROM siggip.evaluaciones e
      WHERE e.id_practica = :id_practica
      ORDER BY e.fecha_evaluacion DESC, e.fecha_registro DESC`;

    const evaluaciones = await sequelize.query(query, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(evaluaciones);
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    return res.status(500).json({ error: 'Error al obtener evaluaciones' });
  }
};

export const crearEvaluacion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_practica } = req.params;
    const {
      tipo_evaluacion,
      fecha_evaluacion,
      periodo_evaluacion,
      observaciones_generales,
      fortalezas_destacadas,
      areas_mejora,
      evaluador_nombre,
      evaluador_cargo,
      competencias
    } = req.body;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    let nota_final = null;
    if (competencias && competencias.length > 0) {
      const suma = competencias.reduce((acc, c) => acc + (c.calificacion || 0), 0);
      nota_final = (suma / competencias.length).toFixed(1);
    }

    const insertEval = await sequelize.query(
      `INSERT INTO siggip.evaluaciones (
        id_practica, tipo_evaluacion, fecha_evaluacion, periodo_evaluacion,
        nota_final, observaciones_generales, fortalezas_destacadas, areas_mejora,
        estado_evaluacion, evaluador_nombre, evaluador_cargo
      ) VALUES (
        :id_practica, :tipo_evaluacion, :fecha_evaluacion, :periodo_evaluacion,
        :nota_final, :observaciones_generales, :fortalezas_destacadas, :areas_mejora,
        'completada', :evaluador_nombre, :evaluador_cargo
      ) RETURNING id_evaluacion`,
      {
        replacements: {
          id_practica,
          tipo_evaluacion,
          fecha_evaluacion,
          periodo_evaluacion,
          nota_final,
          observaciones_generales,
          fortalezas_destacadas,
          areas_mejora,
          evaluador_nombre,
          evaluador_cargo
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    const id_evaluacion = insertEval[0][0].id_evaluacion;

    if (competencias && competencias.length > 0) {
      for (let comp of competencias) {
        await sequelize.query(
          `INSERT INTO siggip.evaluaciones_competencias (
            id_evaluacion, id_competencia, calificacion, observaciones
          ) VALUES (
            :id_evaluacion, :id_competencia, :calificacion, :observaciones
          )`,
          {
            replacements: {
              id_evaluacion,
              id_competencia: comp.id_competencia,
              calificacion: comp.calificacion,
              observaciones: comp.observaciones || null
            },
            type: sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );
      }
    }

    await t.commit();
    return res.status(201).json({ id_evaluacion, success: true });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear evaluación:', error);
    return res.status(500).json({ error: 'Error al crear evaluación' });
  }
};

export const getDetalleEvaluacion = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_evaluacion } = req.params;

    const query = `
      SELECT 
        e.id_evaluacion,
        e.id_practica,
        e.tipo_evaluacion,
        e.fecha_evaluacion,
        e.periodo_evaluacion,
        e.nota_final,
        e.observaciones_generales,
        e.fortalezas_destacadas,
        e.areas_mejora,
        e.estado_evaluacion,
        e.evaluador_nombre,
        e.evaluador_cargo,
        e.fecha_registro
      FROM siggip.evaluaciones e
      JOIN siggip.practicas pr ON pr.id_practica = e.id_practica
      JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
      WHERE e.id_evaluacion = :id_evaluacion AND o.id_empresa = :id_empresa`;

    const evaluacion = await sequelize.query(query, {
      replacements: { id_evaluacion, id_empresa },
      type: sequelize.QueryTypes.SELECT
    });

    if (evaluacion.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada o no autorizada' });
    }

    const competencias = await sequelize.query(
      `SELECT 
        ec.id_eval_competencia,
        ec.id_competencia,
        ec.calificacion,
        ec.observaciones,
        c.nombre_competencia,
        c.descripcion_competencia
       FROM siggip.evaluaciones_competencias ec
       JOIN siggip.competencias c ON c.id_competencia = ec.id_competencia
       WHERE ec.id_evaluacion = :id_evaluacion
       ORDER BY c.nombre_competencia`,
      { replacements: { id_evaluacion }, type: sequelize.QueryTypes.SELECT }
    );

    return res.json({
      ...evaluacion[0],
      competencias
    });
  } catch (error) {
    console.error('Error al obtener detalle de evaluación:', error);
    return res.status(500).json({ error: 'Error al obtener detalle de evaluación' });
  }
};

export const actualizarEvaluacion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_evaluacion } = req.params;
    const {
      tipo_evaluacion,
      fecha_evaluacion,
      periodo_evaluacion,
      observaciones_generales,
      fortalezas_destacadas,
      areas_mejora,
      evaluador_nombre,
      evaluador_cargo,
      competencias
    } = req.body;

    const verificacion = await sequelize.query(
      `SELECT e.id_evaluacion
       FROM siggip.evaluaciones e
       JOIN siggip.practicas pr ON pr.id_practica = e.id_practica
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       WHERE e.id_evaluacion = :id_evaluacion AND o.id_empresa = :id_empresa`,
      { replacements: { id_evaluacion, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Evaluación no encontrada o no autorizada' });
    }

    let nota_final = null;
    if (competencias && competencias.length > 0) {
      const suma = competencias.reduce((acc, c) => acc + (c.calificacion || 0), 0);
      nota_final = (suma / competencias.length).toFixed(1);
    }

    await sequelize.query(
      `UPDATE siggip.evaluaciones
       SET tipo_evaluacion = COALESCE(:tipo_evaluacion, tipo_evaluacion),
           fecha_evaluacion = COALESCE(:fecha_evaluacion, fecha_evaluacion),
           periodo_evaluacion = COALESCE(:periodo_evaluacion, periodo_evaluacion),
           nota_final = COALESCE(:nota_final, nota_final),
           observaciones_generales = COALESCE(:observaciones_generales, observaciones_generales),
           fortalezas_destacadas = COALESCE(:fortalezas_destacadas, fortalezas_destacadas),
           areas_mejora = COALESCE(:areas_mejora, areas_mejora),
           evaluador_nombre = COALESCE(:evaluador_nombre, evaluador_nombre),
           evaluador_cargo = COALESCE(:evaluador_cargo, evaluador_cargo)
       WHERE id_evaluacion = :id_evaluacion`,
      {
        replacements: {
          id_evaluacion,
          tipo_evaluacion,
          fecha_evaluacion,
          periodo_evaluacion,
          nota_final,
          observaciones_generales,
          fortalezas_destacadas,
          areas_mejora,
          evaluador_nombre,
          evaluador_cargo
        },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    if (competencias && competencias.length > 0) {
      await sequelize.query(
        `DELETE FROM siggip.evaluaciones_competencias WHERE id_evaluacion = :id_evaluacion`,
        { replacements: { id_evaluacion }, type: sequelize.QueryTypes.DELETE, transaction: t }
      );

      for (let comp of competencias) {
        await sequelize.query(
          `INSERT INTO siggip.evaluaciones_competencias (
            id_evaluacion, id_competencia, calificacion, observaciones
          ) VALUES (
            :id_evaluacion, :id_competencia, :calificacion, :observaciones
          )`,
          {
            replacements: {
              id_evaluacion,
              id_competencia: comp.id_competencia,
              calificacion: comp.calificacion,
              observaciones: comp.observaciones || null
            },
            type: sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );
      }
    }

    await t.commit();
    return res.json({ success: true, message: 'Evaluación actualizada correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar evaluación:', error);
    return res.status(500).json({ error: 'Error al actualizar evaluación' });
  }
};

// ==================== Obtener Mi Empresa ====================

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

// ==================== EVALUACIÓN FINAL (SISTEMA NUEVO) ====================

export const getEstructuraEvaluacion = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, est.id_especialidad, esp.nombre_especialidad, esp.codigo_especialidad
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica o ON o.id_oferta = pr.id_oferta
       JOIN siggip.estudiantes est ON est.id_estudiante = pr.id_estudiante
       JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
       WHERE pr.id_practica = :id_practica AND o.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const practica = verificacion[0];

    const areas = await sequelize.query(
      `SELECT 
        ac.id_area_competencia,
        ac.numero_area,
        ac.nombre_area,
        ac.descripcion_area,
        ac.objetivo_terminal
       FROM siggip.areas_competencia ac
       WHERE ac.id_especialidad = :id_especialidad
         AND ac.estado = 'activo'
       ORDER BY ac.numero_area`,
      { replacements: { id_especialidad: practica.id_especialidad }, type: sequelize.QueryTypes.SELECT }
    );

    for (let area of areas) {
      const tareas = await sequelize.query(
        `SELECT 
          tc.id_tarea,
          tc.codigo_tarea,
          tc.descripcion_tarea,
          tc.es_obligatoria,
          tc.orden_secuencia
         FROM siggip.tareas_competencia tc
         WHERE tc.id_area_competencia = :id_area_competencia
           AND tc.estado = 'activo'
         ORDER BY tc.orden_secuencia`,
        { replacements: { id_area_competencia: area.id_area_competencia }, type: sequelize.QueryTypes.SELECT }
      );
      area.tareas = tareas;
    }

    const competenciasEmpleabilidad = await sequelize.query(
      `SELECT 
        ce.id_competencia_empleabilidad,
        ce.nombre_competencia,
        ce.descripcion,
        ce.orden_visualizacion
       FROM siggip.competencias_empleabilidad ce
       WHERE ce.estado = 'activo'
       ORDER BY ce.orden_visualizacion`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.json({
      id_practica,
      especialidad: {
        id: practica.id_especialidad,
        nombre: practica.nombre_especialidad,
        codigo: practica.codigo_especialidad
      },
      areas_competencia: areas,
      competencias_empleabilidad: competenciasEmpleabilidad,
      escalas: {
        areas_tecnicas: {
          tipo: 'numerica',
          min: 1.0,
          max: 7.0,
          paso: 0.1
        },
        tareas: {
          tipo: 'categorial',
          opciones: ['excelente', 'bueno', 'suficiente', 'insuficiente'],
          labels: {
            excelente: 'E - Excelente',
            bueno: 'B - Bueno',
            suficiente: 'S - Suficiente',
            insuficiente: 'I - Insuficiente'
          }
        },
        empleabilidad: {
          tipo: 'categorial',
          opciones: ['excelente', 'bueno', 'suficiente', 'insuficiente'],
          labels: {
            excelente: 'E - Excelente',
            bueno: 'B - Bueno',
            suficiente: 'S - Suficiente',
            insuficiente: 'I - Insuficiente'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estructura de evaluación:', error);
    return res.status(500).json({ error: 'Error al obtener estructura de evaluación' });
  }
};

export const verificarEvaluacionFinal = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, pr.horas_completadas, of.duracion_horas, pr.estado_practica
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND of.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const practica = verificacion[0];
    const evaluacion = await sequelize.query(
      `SELECT id_evaluacion, estado_evaluacion, calificacion_empresa, calificacion_profesor,
              calificacion_final, fecha_evaluacion_empresa, fecha_evaluacion_profesor, comentarios_empresa
       FROM siggip.evaluaciones_finales WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    const progresoHoras = practica.duracion_horas > 0 
      ? Math.round((practica.horas_completadas / practica.duracion_horas) * 100) : 0;
    const puede_evaluar = progresoHoras >= 80;
    const puede_modificar = evaluacion.length > 0 && ['pendiente', 'en_proceso'].includes(evaluacion[0].estado_evaluacion);

    let mensaje = '';
    if (evaluacion.length > 0) {
      const estado = evaluacion[0].estado_evaluacion;
      mensaje = estado === 'completada' ? '✅ Evaluación completada. Pendiente certificación profesor.' :
                estado === 'en_proceso' ? '📝 Evaluación en progreso. Puedes continuar editando.' :
                `Estado: ${estado}`;
    } else {
      mensaje = puede_evaluar
        ? '✅ Cumple requisitos. Puede iniciar evaluación final.'
        : `⚠️ Faltan horas: ${practica.horas_completadas}/${practica.duracion_horas} (${progresoHoras}%). Mínimo: 80%`;
    }

    return res.json({
      existe: evaluacion.length > 0,
      evaluacion: evaluacion.length > 0 ? evaluacion[0] : null,
      puede_evaluar,
      puede_modificar,
      progreso_horas: progresoHoras,
      horas_completadas: practica.horas_completadas,
      horas_requeridas: practica.duracion_horas,
      estado_practica: practica.estado_practica,
      mensaje
    });
  } catch (error) {
    console.error('Error al verificar evaluación final:', error);
    return res.status(500).json({ error: 'Error al verificar evaluación final' });
  }
};

// ✅ FUNCIÓN CORREGIDA CON id_estudiante e id_profesor_guia
export const crearEvaluacionFinal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_practica } = req.params;
    const { evaluaciones_areas, evaluaciones_tareas, evaluaciones_empleabilidad, maestro_guia, comentarios_generales } = req.body;

    if (!evaluaciones_areas || !Array.isArray(evaluaciones_areas) || evaluaciones_areas.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debe evaluar al menos un área de competencia' });
    }
    if (!evaluaciones_empleabilidad || !Array.isArray(evaluaciones_empleabilidad) || evaluaciones_empleabilidad.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debe evaluar las competencias de empleabilidad' });
    }

    // ✅ OBTENER id_estudiante e id_profesor_guia
    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, pr.horas_completadas, pr.id_estudiante, pr.id_profesor_guia, of.duracion_horas
       FROM siggip.practicas pr 
       JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND of.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const practica = verificacion[0];
    const progresoHoras = Math.round((practica.horas_completadas / practica.duracion_horas) * 100);
    
    if (progresoHoras < 80) {
      await t.rollback();
      return res.status(400).json({ 
        error: `Progreso insuficiente: ${progresoHoras}% (mínimo 80%)`,
        horas_completadas: practica.horas_completadas,
        horas_requeridas: practica.duracion_horas
      });
    }

    const sumaAreas = evaluaciones_areas.reduce((sum, a) => sum + parseFloat(a.calificacion || 0), 0);
    const promedioAreas = (sumaAreas / evaluaciones_areas.length).toFixed(2);

    // ✅ INSERTAR CON id_estudiante e id_profesor_guia
    const upsertEvaluacion = await sequelize.query(
      `INSERT INTO siggip.evaluaciones_finales (
         id_practica, 
         id_estudiante, 
         id_profesor_guia, 
         calificacion_empresa, 
         comentarios_empresa, 
         fecha_evaluacion_empresa, 
         estado_evaluacion
       )
       VALUES (
         :id_practica, 
         :id_estudiante, 
         :id_profesor_guia, 
         :calificacion_empresa, 
         :comentarios_empresa, 
         CURRENT_TIMESTAMP, 
         'en_proceso'
       )
       ON CONFLICT (id_practica) DO UPDATE SET
         calificacion_empresa = EXCLUDED.calificacion_empresa,
         comentarios_empresa = EXCLUDED.comentarios_empresa,
         fecha_evaluacion_empresa = CURRENT_TIMESTAMP,
         estado_evaluacion = 'en_proceso',
         id_estudiante = EXCLUDED.id_estudiante,
         id_profesor_guia = EXCLUDED.id_profesor_guia
       RETURNING id_evaluacion, estado_evaluacion`,
      { 
        replacements: { 
          id_practica, 
          id_estudiante: practica.id_estudiante, 
          id_profesor_guia: practica.id_profesor_guia, 
          calificacion_empresa: promedioAreas, 
          comentarios_empresa: comentarios_generales || null 
        },
        type: sequelize.QueryTypes.INSERT, 
        transaction: t 
      }
    );

    const resultado = upsertEvaluacion[0][0];

    await sequelize.query(`DELETE FROM siggip.evaluaciones_areas_competencia WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

    for (let area of evaluaciones_areas) {
      await sequelize.query(
        `INSERT INTO siggip.evaluaciones_areas_competencia (id_practica, id_area_competencia, calificacion, comentarios, evaluador_tipo)
         VALUES (:id_practica, :id_area_competencia, :calificacion, :comentarios, 'maestro_guia')`,
        { replacements: { id_practica, id_area_competencia: area.id_area_competencia, calificacion: area.calificacion, comentarios: area.comentarios || null },
          type: sequelize.QueryTypes.INSERT, transaction: t }
      );
    }

    if (evaluaciones_tareas && Array.isArray(evaluaciones_tareas) && evaluaciones_tareas.length > 0) {
      await sequelize.query(`DELETE FROM siggip.evaluaciones_tareas WHERE id_practica = :id_practica`,
        { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

      for (let tarea of evaluaciones_tareas) {
        const nivelLogroMapeado = mapearNivelLogro(tarea.nivel_logro);
        if (!nivelLogroMapeado) continue;
        await sequelize.query(
          `INSERT INTO siggip.evaluaciones_tareas (id_practica, id_tarea, nivel_logro, fue_realizada, comentarios)
           VALUES (:id_practica, :id_tarea, :nivel_logro, :fue_realizada, :comentarios)`,
          { replacements: { id_practica, id_tarea: tarea.id_tarea, nivel_logro: nivelLogroMapeado, 
            fue_realizada: tarea.fue_realizada !== false, comentarios: tarea.comentarios || null },
            type: sequelize.QueryTypes.INSERT, transaction: t }
        );
      }
    }

    await sequelize.query(`DELETE FROM siggip.evaluaciones_empleabilidad WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

    for (let emp of evaluaciones_empleabilidad) {
      const nivelLogroMapeado = mapearNivelLogro(emp.nivel_logro);
      if (!nivelLogroMapeado) continue;
      await sequelize.query(
        `INSERT INTO siggip.evaluaciones_empleabilidad (id_practica, id_competencia_empleabilidad, nivel_logro, observaciones, evaluador_tipo)
         VALUES (:id_practica, :id_competencia_empleabilidad, :nivel_logro, :observaciones, 'maestro_guia')`,
        { replacements: { id_practica, id_competencia_empleabilidad: emp.id_competencia_empleabilidad,
          nivel_logro: nivelLogroMapeado, observaciones: emp.observaciones || null },
          type: sequelize.QueryTypes.INSERT, transaction: t }
      );
    }

    if (maestro_guia && maestro_guia.nombre) {
      await sequelize.query(
        `UPDATE siggip.planes_practica 
         SET maestro_guia_nombre = :nombre, maestro_guia_rut = :rut, maestro_guia_cargo = :cargo,
             maestro_guia_email = :email, maestro_guia_telefono = :telefono
         WHERE id_practica = :id_practica`,
        { replacements: { id_practica, nombre: maestro_guia.nombre || null, rut: maestro_guia.rut || null,
          cargo: maestro_guia.cargo || null, email: maestro_guia.email || null, telefono: maestro_guia.telefono || null },
          type: sequelize.QueryTypes.UPDATE, transaction: t }
      );
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: '✅ Evaluación guardada como borrador',
      id_evaluacion: resultado.id_evaluacion,
      estado: resultado.estado_evaluacion,
      resumen: {
        promedio_areas: promedioAreas,
        areas_evaluadas: evaluaciones_areas.length,
        tareas_evaluadas: evaluaciones_tareas?.length || 0,
        competencias_empleabilidad: evaluaciones_empleabilidad.length
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear evaluación final:', error);
    return res.status(500).json({ error: 'Error al crear evaluación final', detalle: error.message });
  }
};

// ✅ FUNCIÓN CORREGIDA - Actualiza estado_evaluacion a 'completada'
export const finalizarEvaluacionFinal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica FROM siggip.practicas pr
       JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND of.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const evaluacion = await sequelize.query(
      `SELECT id_evaluacion, estado_evaluacion FROM siggip.evaluaciones_finales WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (evaluacion.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No existe evaluación para finalizar. Guarda primero la evaluación.' });
    }

    if (evaluacion[0].estado_evaluacion !== 'en_proceso') {
      await t.rollback();
      return res.status(400).json({ error: `No se puede finalizar. Estado actual: ${evaluacion[0].estado_evaluacion}` });
    }

    const areas = await sequelize.query(
      `SELECT COUNT(*) as total FROM siggip.evaluaciones_areas_competencia
       WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const empleabilidad = await sequelize.query(
      `SELECT COUNT(*) as total FROM siggip.evaluaciones_empleabilidad
       WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (areas[0].total === 0 || empleabilidad[0].total === 0) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Evaluación incompleta. Debe completar áreas técnicas y empleabilidad.',
        areas_evaluadas: parseInt(areas[0].total),
        empleabilidad_evaluada: parseInt(empleabilidad[0].total)
      });
    }

    // ✅ ACTUALIZAR ESTADO A 'completada'
    await sequelize.query(
      `UPDATE siggip.evaluaciones_finales 
       SET estado_evaluacion = 'completada', 
           fecha_evaluacion_empresa = CURRENT_TIMESTAMP
       WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.UPDATE, transaction: t }
    );

    await t.commit();

    return res.json({
      success: true,
      mensaje: '🎉 Evaluación final completada exitosamente',
      detalle: 'La evaluación ahora será enviada al profesor tutor para su certificación.',
      siguiente_paso: 'El profesor tutor debe revisar y certificar la evaluación'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al finalizar evaluación:', error);
    return res.status(500).json({ error: 'Error al finalizar evaluación' });
  }
};

export const getEvaluacionFinal = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });

    const { id_practica } = req.params;

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, est.id_especialidad, esp.nombre_especialidad, esp.codigo_especialidad
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
       JOIN siggip.estudiantes est ON est.id_estudiante = pr.id_estudiante
       JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
       WHERE pr.id_practica = :id_practica AND of.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const practica = verificacion[0];

    const evaluacionFinal = await sequelize.query(
      `SELECT id_evaluacion, calificacion_empresa, comentarios_empresa, fecha_evaluacion_empresa,
              calificacion_profesor, comentarios_profesor, fecha_evaluacion_profesor,
              calificacion_final, estado_evaluacion
       FROM siggip.evaluaciones_finales WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    if (evaluacionFinal.length === 0) {
      return res.status(404).json({ error: 'Evaluación final no encontrada' });
    }

    const areas = await sequelize.query(
      `SELECT eac.id_evaluacion_area, eac.id_area_competencia, eac.calificacion, eac.comentarios,
              eac.fecha_evaluacion, ac.numero_area, ac.nombre_area
       FROM siggip.evaluaciones_areas_competencia eac
       JOIN siggip.areas_competencia ac ON ac.id_area_competencia = eac.id_area_competencia
       WHERE eac.id_practica = :id_practica AND eac.evaluador_tipo = 'maestro_guia'
       ORDER BY ac.numero_area`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    const tareas = await sequelize.query(
      `SELECT et.id_evaluacion_tarea, et.id_tarea, et.nivel_logro, et.fue_realizada, et.comentarios,
              et.fecha_evaluacion, tc.codigo_tarea, tc.descripcion_tarea, tc.id_area_competencia
       FROM siggip.evaluaciones_tareas et
       JOIN siggip.tareas_competencia tc ON tc.id_tarea = et.id_tarea
       WHERE et.id_practica = :id_practica ORDER BY tc.orden_secuencia`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    const empleabilidad = await sequelize.query(
      `SELECT ee.id_evaluacion_empleabilidad, ee.id_competencia_empleabilidad, ee.nivel_logro,
              ee.observaciones, ee.fecha_evaluacion, ce.nombre_competencia, ce.descripcion, ce.orden_visualizacion
       FROM siggip.evaluaciones_empleabilidad ee
       JOIN siggip.competencias_empleabilidad ce ON ce.id_competencia_empleabilidad = ee.id_competencia_empleabilidad
       WHERE ee.id_practica = :id_practica AND ee.evaluador_tipo = 'maestro_guia'
       ORDER BY ce.orden_visualizacion`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    return res.json({
      ...evaluacionFinal[0],
      especialidad: { id: practica.id_especialidad, nombre: practica.nombre_especialidad, codigo: practica.codigo_especialidad },
      evaluaciones_areas: areas,
      evaluaciones_tareas: tareas,
      evaluaciones_empleabilidad: empleabilidad,
      resumen: { promedio_areas: evaluacionFinal[0].calificacion_empresa, total_areas: areas.length,
        total_tareas: tareas.length, total_empleabilidad: empleabilidad.length }
    });
  } catch (error) {
    console.error('Error al obtener evaluación final:', error);
    return res.status(500).json({ error: 'Error al obtener evaluación final' });
  }
};

// ✅ FUNCIÓN CORREGIDA CON id_estudiante e id_profesor_guia
export const actualizarEvaluacionFinal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id_usuario = req.usuario?.id;
    const id_empresa = await getIdEmpresaFromUsuario(id_usuario);
    if (!id_empresa) {
      await t.rollback();
      return res.status(403).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const { id_practica } = req.params;
    const { evaluaciones_areas, evaluaciones_tareas, evaluaciones_empleabilidad, maestro_guia, comentarios_generales } = req.body;

    // ✅ OBTENER id_estudiante e id_profesor_guia
    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, pr.id_estudiante, pr.id_profesor_guia 
       FROM siggip.practicas pr
       JOIN siggip.ofertas_practica of ON of.id_oferta = pr.id_oferta
       WHERE pr.id_practica = :id_practica AND of.id_empresa = :id_empresa`,
      { replacements: { id_practica, id_empresa }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Práctica no encontrada o no autorizada' });
    }

    const practica = verificacion[0];

    const evaluacion = await sequelize.query(
      `SELECT estado_evaluacion FROM siggip.evaluaciones_finales WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (evaluacion.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    if (!['pendiente', 'en_proceso'].includes(evaluacion[0].estado_evaluacion)) {
      await t.rollback();
      return res.status(400).json({ 
        error: `No se puede modificar. Estado actual: ${evaluacion[0].estado_evaluacion}`,
        mensaje: 'La evaluación ya fue finalizada y no puede ser editada.'
      });
    }

    const sumaAreas = evaluaciones_areas.reduce((sum, a) => sum + parseFloat(a.calificacion || 0), 0);
    const promedioAreas = (sumaAreas / evaluaciones_areas.length).toFixed(2);

    // ✅ ACTUALIZAR CON id_estudiante e id_profesor_guia
    await sequelize.query(
      `UPDATE siggip.evaluaciones_finales
       SET calificacion_empresa = :calificacion_empresa, 
           comentarios_empresa = :comentarios_empresa,
           fecha_evaluacion_empresa = CURRENT_TIMESTAMP,
           id_estudiante = :id_estudiante,
           id_profesor_guia = :id_profesor_guia
       WHERE id_practica = :id_practica`,
      { 
        replacements: { 
          id_practica, 
          id_estudiante: practica.id_estudiante,
          id_profesor_guia: practica.id_profesor_guia,
          calificacion_empresa: promedioAreas, 
          comentarios_empresa: comentarios_generales || null 
        },
        type: sequelize.QueryTypes.UPDATE, 
        transaction: t 
      }
    );

    await sequelize.query(`DELETE FROM siggip.evaluaciones_areas_competencia WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

    for (let area of evaluaciones_areas) {
      await sequelize.query(
        `INSERT INTO siggip.evaluaciones_areas_competencia (id_practica, id_area_competencia, calificacion, comentarios, evaluador_tipo)
         VALUES (:id_practica, :id_area_competencia, :calificacion, :comentarios, 'maestro_guia')`,
        { replacements: { id_practica, id_area_competencia: area.id_area_competencia, calificacion: area.calificacion, comentarios: area.comentarios || null },
          type: sequelize.QueryTypes.INSERT, transaction: t }
      );
    }

    if (evaluaciones_tareas && Array.isArray(evaluaciones_tareas) && evaluaciones_tareas.length > 0) {
      await sequelize.query(`DELETE FROM siggip.evaluaciones_tareas WHERE id_practica = :id_practica`,
        { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

      for (let tarea of evaluaciones_tareas) {
        const nivelLogroMapeado = mapearNivelLogro(tarea.nivel_logro);
        if (!nivelLogroMapeado) continue;
        await sequelize.query(
          `INSERT INTO siggip.evaluaciones_tareas (id_practica, id_tarea, nivel_logro, fue_realizada, comentarios)
           VALUES (:id_practica, :id_tarea, :nivel_logro, :fue_realizada, :comentarios)`,
          { replacements: { id_practica, id_tarea: tarea.id_tarea, nivel_logro: nivelLogroMapeado, 
            fue_realizada: tarea.fue_realizada !== false, comentarios: tarea.comentarios || null },
            type: sequelize.QueryTypes.INSERT, transaction: t }
        );
      }
    }

    await sequelize.query(`DELETE FROM siggip.evaluaciones_empleabilidad WHERE id_practica = :id_practica AND evaluador_tipo = 'maestro_guia'`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.DELETE, transaction: t });

    for (let emp of evaluaciones_empleabilidad) {
      const nivelLogroMapeado = mapearNivelLogro(emp.nivel_logro);
      if (!nivelLogroMapeado) continue;
      await sequelize.query(
        `INSERT INTO siggip.evaluaciones_empleabilidad (id_practica, id_competencia_empleabilidad, nivel_logro, observaciones, evaluador_tipo)
         VALUES (:id_practica, :id_competencia_empleabilidad, :nivel_logro, :observaciones, 'maestro_guia')`,
        { replacements: { id_practica, id_competencia_empleabilidad: emp.id_competencia_empleabilidad,
          nivel_logro: nivelLogroMapeado, observaciones: emp.observaciones || null },
          type: sequelize.QueryTypes.INSERT, transaction: t }
      );
    }

    if (maestro_guia && maestro_guia.nombre) {
      await sequelize.query(
        `UPDATE siggip.planes_practica 
         SET maestro_guia_nombre = :nombre, maestro_guia_rut = :rut, maestro_guia_cargo = :cargo,
             maestro_guia_email = :email, maestro_guia_telefono = :telefono
         WHERE id_practica = :id_practica`,
        { replacements: { id_practica, nombre: maestro_guia.nombre || null, rut: maestro_guia.rut || null,
          cargo: maestro_guia.cargo || null, email: maestro_guia.email || null, telefono: maestro_guia.telefono || null },
          type: sequelize.QueryTypes.UPDATE, transaction: t }
      );
    }

    await t.commit();
    return res.json({ success: true, message: '✅ Evaluación actualizada correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar evaluación final:', error);
    return res.status(500).json({ error: 'Error al actualizar evaluación final' });
  }
};