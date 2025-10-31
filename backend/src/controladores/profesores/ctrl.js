// 📁 backend/src/controladores/profesores/ctrl.js
// 🎯 Controlador para profesores - CORREGIDO con columnas reales

import { sequelize } from '../../configuracion/baseDatos.js';

// ==================== OBTENER PERFIL DEL PROFESOR AUTENTICADO ====================
export const obtenerPerfilProfesor = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const query = `
      SELECT 
        p.id_profesor,
        p.codigo_profesor,
        p.cargo,
        p.anos_experiencia,
        p.titulo_profesional,
        p.estado_profesor,
        p.fecha_actualizacion,
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.rut,
        u.email,
        u.telefono,
        u.direccion,
        u.foto_perfil,
        u.estado as estado_usuario,
        u.fecha_creacion,
        u.ultimo_acceso,
        esp.id_especialidad,
        esp.codigo_especialidad,
        esp.nombre_especialidad,
        esp.descripcion as especialidad_descripcion,
        esp.sector_economico
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.especialidades esp ON p.id_especialidad = esp.id_especialidad
      WHERE p.id_usuario = :id_usuario
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'Perfil de profesor no encontrado' });
    }

    return res.json(resultado[0]);

  } catch (error) {
    console.error('❌ Error al obtener perfil del profesor:', error);
    return res.status(500).json({ error: 'Error al obtener perfil del profesor' });
  }
};

// ==================== OBTENER TODOS LOS PROFESORES ====================
export const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      busqueda = '', 
      especialidad = '', 
      estado = 'activo'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const replacements = { limit: parseInt(limit), offset: parseInt(offset) };

    if (busqueda) {
      whereClause += ` AND (
        u.nombre ILIKE :busqueda OR 
        u.apellido_paterno ILIKE :busqueda OR 
        u.apellido_materno ILIKE :busqueda OR 
        u.rut ILIKE :busqueda OR 
        u.email ILIKE :busqueda OR
        p.codigo_profesor ILIKE :busqueda
      )`;
      replacements.busqueda = `%${busqueda}%`;
    }

    if (especialidad && especialidad !== 'todas') {
      whereClause += ' AND p.id_especialidad = :especialidad';
      replacements.especialidad = especialidad;
    }

    if (estado && estado !== 'todos') {
      whereClause += ' AND p.estado_profesor = :estado';
      replacements.estado = estado;
    }

    const query = `
      SELECT 
        p.id_profesor,
        p.codigo_profesor,
        p.cargo,
        p.anos_experiencia,
        p.titulo_profesional,
        p.estado_profesor,
        p.fecha_actualizacion,
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.rut,
        u.email,
        u.telefono,
        u.direccion,
        u.foto_perfil,
        u.estado as estado_usuario,
        esp.id_especialidad,
        esp.codigo_especialidad,
        esp.nombre_especialidad,
        esp.sector_economico,
        (
          SELECT COUNT(*) 
          FROM siggip.practicas pr 
          WHERE pr.id_profesor_guia = p.id_profesor
        ) as total_practicas
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.especialidades esp ON p.id_especialidad = esp.id_especialidad
      ${whereClause}
      ORDER BY p.id_profesor DESC
      LIMIT :limit OFFSET :offset
    `;

    const profesores = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.especialidades esp ON p.id_especialidad = esp.id_especialidad
      ${whereClause}
    `;

    const countResult = await sequelize.query(countQuery, {
      replacements: estado || especialidad || busqueda ? replacements : {},
      type: sequelize.QueryTypes.SELECT
    });

    const total = parseInt(countResult[0].total);

    return res.json({
      profesores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener profesores:', error);
    return res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

// ==================== OBTENER UN PROFESOR ====================
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.id_profesor,
        p.codigo_profesor,
        p.cargo,
        p.anos_experiencia,
        p.titulo_profesional,
        p.estado_profesor,
        p.fecha_actualizacion,
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.rut,
        u.email,
        u.telefono,
        u.direccion,
        u.foto_perfil,
        u.estado as estado_usuario,
        u.fecha_creacion,
        u.ultimo_acceso,
        esp.id_especialidad,
        esp.codigo_especialidad,
        esp.nombre_especialidad,
        esp.descripcion as especialidad_descripcion,
        esp.sector_economico,
        esp.duracion_practica_min,
        esp.duracion_practica_max
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.especialidades esp ON p.id_especialidad = esp.id_especialidad
      WHERE p.id_profesor = :id
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    // Obtener prácticas del profesor
    const practicasQuery = `
      SELECT 
        pr.id_practica,
        pr.codigo_practica,
        pr.fecha_inicio_practica,
        pr.fecha_termino_practica,
        pr.estado_practica,
        pr.horas_completadas,
        e.codigo_estudiante,
        u_est.nombre as estudiante_nombre,
        u_est.apellido_paterno as estudiante_apellido,
        emp.razon_social as empresa_nombre,
        of.titulo_oferta
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.usuarios u_est ON e.id_usuario = u_est.id_usuario
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE pr.id_profesor_guia = :id
      ORDER BY pr.fecha_asignacion DESC
      LIMIT 10
    `;

    const practicas = await sequelize.query(practicasQuery, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      ...resultado[0],
      practicas_asignadas: practicas
    });

  } catch (error) {
    console.error('❌ Error al obtener profesor:', error);
    return res.status(500).json({ error: 'Error al obtener profesor' });
  }
};

// ==================== ESTADÍSTICAS ====================
export const getEstadisticas = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_profesores,
        COUNT(CASE WHEN p.estado_profesor = 'activo' THEN 1 END) as profesores_activos,
        COUNT(CASE WHEN p.estado_profesor = 'inactivo' THEN 1 END) as profesores_inactivos,
        ROUND(AVG(p.anos_experiencia), 1) as promedio_experiencia,
        COUNT(CASE WHEN p.id_especialidad = 1 THEN 1 END) as profesores_mecanica,
        COUNT(CASE WHEN p.id_especialidad = 2 THEN 1 END) as profesores_agropecuaria,
        COUNT(CASE WHEN p.id_especialidad IS NULL THEN 1 END) as sin_especialidad
      FROM siggip.profesores p
    `;

    const estadisticas = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    const practicasQuery = `
      SELECT 
        p.id_profesor,
        p.codigo_profesor,
        u.nombre,
        u.apellido_paterno,
        COUNT(pr.id_practica) as total_practicas,
        COUNT(CASE WHEN pr.estado_practica = 'asignada' THEN 1 END) as practicas_asignadas,
        COUNT(CASE WHEN pr.estado_practica = 'en_curso' THEN 1 END) as practicas_en_curso,
        COUNT(CASE WHEN pr.estado_practica = 'completada' THEN 1 END) as practicas_completadas
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.practicas pr ON p.id_profesor = pr.id_profesor_guia
      WHERE p.estado_profesor = 'activo'
      GROUP BY p.id_profesor, p.codigo_profesor, u.nombre, u.apellido_paterno
      ORDER BY total_practicas DESC
      LIMIT 5
    `;

    const profesoresActivos = await sequelize.query(practicasQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      ...estadisticas[0],
      profesores_mas_activos: profesoresActivos
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ==================== ACTUALIZAR PROFESOR ====================
export const update = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      id_especialidad,
      cargo,
      anos_experiencia,
      titulo_profesional
    } = req.body;

    // Verificar que el profesor existe
    const verificarQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_profesor = :id
    `;

    const existe = await sequelize.query(verificarQuery, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!existe || existe.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    // Actualizar datos de profesor
    const updateQuery = `
      UPDATE siggip.profesores
      SET 
        id_especialidad = COALESCE(:id_especialidad, id_especialidad),
        cargo = COALESCE(:cargo, cargo),
        anos_experiencia = COALESCE(:anos_experiencia, anos_experiencia),
        titulo_profesional = COALESCE(:titulo_profesional, titulo_profesional),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_profesor = :id
    `;

    await sequelize.query(updateQuery, {
      replacements: {
        id,
        id_especialidad: id_especialidad || null,
        cargo: cargo || null,
        anos_experiencia: anos_experiencia || null,
        titulo_profesional: titulo_profesional || null
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await t.commit();

    // Obtener profesor actualizado
    const profesorQuery = `
      SELECT 
        p.*,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        esp.nombre_especialidad
      FROM siggip.profesores p
      INNER JOIN siggip.usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN siggip.especialidades esp ON p.id_especialidad = esp.id_especialidad
      WHERE p.id_profesor = :id
    `;

    const profesorActualizado = await sequelize.query(profesorQuery, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      success: true,
      message: 'Profesor actualizado exitosamente',
      profesor: profesorActualizado[0]
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error al actualizar profesor:', error);
    return res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};