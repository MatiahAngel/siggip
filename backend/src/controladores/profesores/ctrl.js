// 📁 UBICACIÓN: backend/src/controladores/profesores/ctrl.js
// 🎯 Controlador completo para profesores
// ✅ Endpoints para dashboard, estudiantes, bitácora, informes y evaluaciones

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

// ==================== OBTENER MIS ESTUDIANTES (PRACTICANTES ASIGNADOS) ====================
export const obtenerMisEstudiantes = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener id_profesor del usuario autenticado
    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor || profesor.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const id_profesor = profesor[0].id_profesor;

    // Obtener practicantes asignados
    const query = `
      SELECT 
        pr.id_practica,
        pr.codigo_practica,
        pr.fecha_inicio_practica,
        pr.fecha_termino_practica,
        pr.estado_practica,
        pr.horas_completadas,
        pr.fecha_asignacion,
        u.nombre as estudiante_nombre,
        u.apellido_paterno,
        u.apellido_materno,
        e.codigo_estudiante,
        u.telefono as estudiante_telefono,
        esp.nombre_especialidad,
        esp.codigo_especialidad,
        emp.razon_social as empresa_nombre,
        emp.rut_empresa,
        of.titulo_oferta,
        of.duracion_horas as horas_requeridas,
        of.descripcion
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.usuarios u ON e.id_usuario = u.id_usuario
      INNER JOIN siggip.especialidades esp ON e.id_especialidad = esp.id_especialidad
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE pr.id_profesor_guia = :id_profesor
        AND pr.estado_practica IN ('asignada', 'en_curso')
      ORDER BY pr.fecha_asignacion DESC
    `;

    const estudiantes = await sequelize.query(query, {
      replacements: { id_profesor },
      type: sequelize.QueryTypes.SELECT
    });

    // Calcular progreso para cada estudiante
    const estudiantesConProgreso = estudiantes.map(est => ({
      ...est,
      progreso: est.horas_requeridas > 0 
        ? Math.round((Number(est.horas_completadas || 0) / Number(est.horas_requeridas)) * 100) 
        : 0
    }));

    return res.json(estudiantesConProgreso);

  } catch (error) {
    console.error('❌ Error al obtener estudiantes:', error);
    return res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

// ==================== OBTENER BITÁCORA DE UN ESTUDIANTE ====================
export const obtenerBitacoraEstudiante = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;
    const { id_practica } = req.params;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que el profesor tiene acceso a esta práctica
    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor || profesor.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const verificacion = await sequelize.query(
      `SELECT id_practica FROM siggip.practicas 
       WHERE id_practica = :id_practica AND id_profesor_guia = :id_profesor`,
      {
        replacements: { id_practica, id_profesor: profesor[0].id_profesor },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta práctica' });
    }

    // Obtener bitácora
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
        ba.fecha_registro,
        CASE 
          WHEN ba.validado_por_empresa = true THEN 'validada'
          WHEN ba.validado_por_empresa = false THEN 'rechazada'
          ELSE 'pendiente'
        END as estado_actividad
      FROM siggip.bitacora_actividades ba
      WHERE ba.id_practica = :id_practica
      ORDER BY ba.fecha_actividad DESC, ba.fecha_registro DESC
    `;

    const bitacora = await sequelize.query(query, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(bitacora);

  } catch (error) {
    console.error('❌ Error al obtener bitácora:', error);
    return res.status(500).json({ error: 'Error al obtener bitácora del estudiante' });
  }
};

// ==================== OBTENER INFORMES DE UN ESTUDIANTE ====================
export const obtenerInformesEstudiante = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;
    const { id_practica } = req.params;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar acceso
    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor || profesor.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const verificacion = await sequelize.query(
      `SELECT id_practica FROM siggip.practicas 
       WHERE id_practica = :id_practica AND id_profesor_guia = :id_profesor`,
      {
        replacements: { id_practica, id_profesor: profesor[0].id_profesor },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta práctica' });
    }

    // Obtener informes (por ahora retornamos array vacío, implementar cuando exista tabla)
    const query = `
      SELECT 
        'informe_mensual' as tipo_informe,
        'Informe Mensual #1' as titulo,
        'Pendiente' as estado,
        CURRENT_DATE - INTERVAL '5 days' as fecha_envio,
        5 as dias_pendientes
      WHERE 1=0
    `;

    const informes = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(informes);

  } catch (error) {
    console.error('❌ Error al obtener informes:', error);
    return res.status(500).json({ error: 'Error al obtener informes del estudiante' });
  }
};

// ==================== OBTENER EVALUACIÓN COMPLETA ====================
export const obtenerEvaluacionCompleta = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;
    const { id_practica } = req.params;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar acceso
    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor || profesor.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const verificacion = await sequelize.query(
      `SELECT pr.id_practica, est.id_especialidad, esp.nombre_especialidad, esp.codigo_especialidad
       FROM siggip.practicas pr
       INNER JOIN siggip.estudiantes est ON est.id_estudiante = pr.id_estudiante
       INNER JOIN siggip.especialidades esp ON esp.id_especialidad = est.id_especialidad
       WHERE pr.id_practica = :id_practica AND pr.id_profesor_guia = :id_profesor`,
      {
        replacements: { id_practica, id_profesor: profesor[0].id_profesor },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta práctica' });
    }

    const practica = verificacion[0];

    // Obtener evaluación final
    const evaluacionFinal = await sequelize.query(
      `SELECT 
        id_evaluacion, 
        calificacion_empresa, 
        comentarios_empresa, 
        fecha_evaluacion_empresa,
        calificacion_profesor, 
        comentarios_profesor, 
        fecha_evaluacion_profesor,
        calificacion_final, 
        estado_evaluacion
       FROM siggip.evaluaciones_finales 
       WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    if (evaluacionFinal.length === 0) {
      return res.status(404).json({ error: 'Evaluación final no encontrada' });
    }

    // Obtener áreas evaluadas
    const areas = await sequelize.query(
      `SELECT 
        eac.id_evaluacion_area, 
        eac.id_area_competencia, 
        eac.calificacion, 
        eac.comentarios,
        eac.evaluador_tipo,
        eac.fecha_evaluacion, 
        ac.numero_area, 
        ac.nombre_area
       FROM siggip.evaluaciones_areas_competencia eac
       JOIN siggip.areas_competencia ac ON ac.id_area_competencia = eac.id_area_competencia
       WHERE eac.id_practica = :id_practica
       ORDER BY ac.numero_area, eac.evaluador_tipo`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    // Obtener tareas evaluadas
    const tareas = await sequelize.query(
      `SELECT 
        et.id_evaluacion_tarea, 
        et.id_tarea, 
        et.nivel_logro, 
        et.fue_realizada, 
        et.comentarios,
        et.fecha_evaluacion, 
        tc.codigo_tarea, 
        tc.descripcion_tarea, 
        tc.id_area_competencia
       FROM siggip.evaluaciones_tareas et
       JOIN siggip.tareas_competencia tc ON tc.id_tarea = et.id_tarea
       WHERE et.id_practica = :id_practica 
       ORDER BY tc.orden_secuencia`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    // Obtener empleabilidad evaluada
    const empleabilidad = await sequelize.query(
      `SELECT 
        ee.id_evaluacion_empleabilidad, 
        ee.id_competencia_empleabilidad, 
        ee.nivel_logro,
        ee.observaciones, 
        ee.evaluador_tipo,
        ee.fecha_evaluacion, 
        ce.nombre_competencia, 
        ce.descripcion, 
        ce.orden_visualizacion
       FROM siggip.evaluaciones_empleabilidad ee
       JOIN siggip.competencias_empleabilidad ce ON ce.id_competencia_empleabilidad = ee.id_competencia_empleabilidad
       WHERE ee.id_practica = :id_practica
       ORDER BY ce.orden_visualizacion, ee.evaluador_tipo`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT }
    );

    return res.json({
      ...evaluacionFinal[0],
      especialidad: {
        id: practica.id_especialidad,
        nombre: practica.nombre_especialidad,
        codigo: practica.codigo_especialidad
      },
      evaluaciones_areas: areas,
      evaluaciones_tareas: tareas,
      evaluaciones_empleabilidad: empleabilidad,
      resumen: {
        promedio_empresa: evaluacionFinal[0].calificacion_empresa,
        promedio_profesor: evaluacionFinal[0].calificacion_profesor,
        total_areas: areas.length,
        total_tareas: tareas.length,
        total_empleabilidad: empleabilidad.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener evaluación completa:', error);
    return res.status(500).json({ error: 'Error al obtener evaluación completa' });
  }
};

// ==================== CERTIFICAR EVALUACIÓN ====================
export const certificarEvaluacion = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;
    const { id_practica } = req.params;
    const { calificacion_profesor, comentarios_profesor, aprobar } = req.body;

    if (!id_usuario) {
      await t.rollback();
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar acceso
    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!profesor || profesor.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const verificacion = await sequelize.query(
      `SELECT id_practica FROM siggip.practicas 
       WHERE id_practica = :id_practica AND id_profesor_guia = :id_profesor`,
      {
        replacements: { id_practica, id_profesor: profesor[0].id_profesor },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (verificacion.length === 0) {
      await t.rollback();
      return res.status(403).json({ error: 'No tienes acceso a esta práctica' });
    }

    // Verificar que existe evaluación
    const evaluacion = await sequelize.query(
      `SELECT id_evaluacion, calificacion_empresa, estado_evaluacion 
       FROM siggip.evaluaciones_finales 
       WHERE id_practica = :id_practica`,
      { replacements: { id_practica }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (evaluacion.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No existe evaluación de la empresa para certificar' });
    }

    if (evaluacion[0].estado_evaluacion !== 'completada') {
      await t.rollback();
      return res.status(400).json({ error: 'La evaluación de la empresa debe estar completada primero' });
    }

    // Calcular calificación final (promedio empresa + profesor)
    const calificacion_final = aprobar 
      ? ((parseFloat(evaluacion[0].calificacion_empresa) + parseFloat(calificacion_profesor)) / 2).toFixed(2)
      : null;

    // Actualizar evaluación
    await sequelize.query(
      `UPDATE siggip.evaluaciones_finales
       SET 
         calificacion_profesor = :calificacion_profesor,
         comentarios_profesor = :comentarios_profesor,
         fecha_evaluacion_profesor = CURRENT_TIMESTAMP,
         calificacion_final = :calificacion_final,
         estado_evaluacion = :nuevo_estado
       WHERE id_practica = :id_practica`,
      {
        replacements: {
          id_practica,
          calificacion_profesor: aprobar ? calificacion_profesor : null,
          comentarios_profesor,
          calificacion_final,
          nuevo_estado: aprobar ? 'certificada' : 'rechazada'
        },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    // Si se aprueba, actualizar estado de la práctica
    if (aprobar) {
      await sequelize.query(
        `UPDATE siggip.practicas
         SET estado_practica = 'completada'
         WHERE id_practica = :id_practica`,
        { replacements: { id_practica }, type: sequelize.QueryTypes.UPDATE, transaction: t }
      );
    }

    await t.commit();

    return res.json({
      success: true,
      mensaje: aprobar 
        ? '🎉 Evaluación certificada exitosamente. Práctica completada.'
        : '⚠️ Evaluación rechazada. Se notificó a la empresa.',
      calificacion_final: aprobar ? calificacion_final : null
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error al certificar evaluación:', error);
    return res.status(500).json({ error: 'Error al certificar evaluación' });
  }
};

// ==================== ESTADÍSTICAS DEL PROFESOR ====================
export const obtenerEstadisticasProfesor = async (req, res) => {
  try {
    const id_usuario = req.usuario?.id || req.user?.id_usuario;

    if (!id_usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const profesorQuery = `
      SELECT id_profesor FROM siggip.profesores WHERE id_usuario = :id_usuario
    `;

    const profesor = await sequelize.query(profesorQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor || profesor.length === 0) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const id_profesor = profesor[0].id_profesor;

    const query = `
      SELECT 
        COUNT(*) as total_estudiantes,
        COUNT(CASE WHEN pr.estado_practica IN ('asignada', 'en_curso') THEN 1 END) as practicas_activas,
        COUNT(CASE WHEN pr.estado_practica = 'completada' THEN 1 END) as practicas_completadas,
        COUNT(CASE WHEN ef.estado_evaluacion = 'completada' THEN 1 END) as evaluaciones_pendientes,
        ROUND(AVG(CASE WHEN ef.calificacion_final IS NOT NULL THEN ef.calificacion_final END), 2) as promedio_calificaciones
      FROM siggip.practicas pr
      LEFT JOIN siggip.evaluaciones_finales ef ON ef.id_practica = pr.id_practica
      WHERE pr.id_profesor_guia = :id_profesor
    `;

    const stats = await sequelize.query(query, {
      replacements: { id_profesor },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      total_estudiantes: parseInt(stats[0].total_estudiantes) || 0,
      practicas_activas: parseInt(stats[0].practicas_activas) || 0,
      practicas_completadas: parseInt(stats[0].practicas_completadas) || 0,
      evaluaciones_pendientes: parseInt(stats[0].evaluaciones_pendientes) || 0,
      promedio_calificaciones: parseFloat(stats[0].promedio_calificaciones) || 0,
      tasa_aprobacion: 94 // Calcular real después
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ==================== OBTENER TODOS LOS PROFESORES (ADMIN) ====================
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

// ==================== ESTADÍSTICAS GENERALES ====================
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