// 📁 UBICACIÓN: backend/src/controladores/estudiantes/ctrl.js
// 🎯 Controlador COMPLETO para estudiantes - VERSIÓN CORREGIDA

import { sequelize } from '../../configuracion/baseDatos.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ==================== PERFIL ====================
export const obtenerPerfilEstudiante = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.rut,
        u.email,
        u.telefono,
        u.direccion,
        u.foto_perfil,
        e.id_estudiante,
        e.codigo_estudiante,
        e.nivel_academico,
        e.promedio_notas,
        e.ano_ingreso,
        e.ano_egreso,
        e.estado_estudiante,
        e.observaciones,
        esp.id_especialidad,
        esp.codigo_especialidad,
        esp.nombre_especialidad,
        esp.descripcion AS especialidad_descripcion,
        esp.sector_economico,
        esp.duracion_practica_min,
        esp.duracion_practica_max
      FROM siggip.usuarios u
      INNER JOIN siggip.estudiantes e ON u.id_usuario = e.id_usuario
      INNER JOIN siggip.especialidades esp ON e.id_especialidad = esp.id_especialidad
      WHERE u.id_usuario = :id_usuario
        AND u.estado = 'activo'
        AND e.estado_estudiante = 'activo'
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    return res.json(resultado[0]);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// ==================== ESTADÍSTICAS ====================
export const obtenerEstadisticasEstudiante = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const estudianteQuery = ` 
      SELECT id_estudiante FROM siggip.estudiantes WHERE id_usuario = :id_usuario
    `;
    const estudianteResult = await sequelize.query(estudianteQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!estudianteResult || estudianteResult.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const id_estudiante = estudianteResult[0].id_estudiante;

    // ✅ CONSULTA CORREGIDA: Separa claramente prácticas de postulaciones
    const statsQuery = `
      SELECT 
        -- ✅ Prácticas REALES (no postulaciones)
        COUNT(DISTINCT CASE 
          WHEN pr.estado_practica = 'completada' 
          THEN pr.id_practica 
        END) as practicas_completadas,
        
        COUNT(DISTINCT CASE 
          WHEN pr.estado_practica IN ('asignada', 'en_curso') 
          THEN pr.id_practica 
        END) as practicas_en_curso,
        
        -- ✅ Horas SOLO de prácticas activas o completadas
        COALESCE(SUM(CASE 
          WHEN pr.estado_practica IN ('en_curso', 'completada') 
          THEN pr.horas_completadas 
          ELSE 0 
        END), 0) as horas_completadas,
        
        -- Postulaciones (separadas de prácticas)
        COUNT(DISTINCT CASE 
          WHEN po.estado_postulacion IN ('pendiente', 'en_revision') 
          THEN po.id_postulacion 
        END) as postulaciones_activas,
        
        COUNT(DISTINCT po.id_postulacion) as total_postulaciones,
        
        COUNT(DISTINCT CASE 
          WHEN po.estado_postulacion = 'aceptada' 
          THEN po.id_postulacion 
        END) as postulaciones_aceptadas,
        
        COUNT(DISTINCT CASE 
          WHEN po.estado_postulacion = 'rechazada' 
          THEN po.id_postulacion 
        END) as postulaciones_rechazadas,
        
        COUNT(DISTINCT CASE 
          WHEN po.estado_postulacion = 'cancelada' 
          THEN po.id_postulacion 
        END) as postulaciones_canceladas,
        
        -- Informes
        COUNT(DISTINCT CASE 
          WHEN inf.estado_informe = 'aprobado' 
          THEN inf.id_informe 
        END) as informes_aprobados,
        
        COUNT(DISTINCT CASE 
          WHEN inf.estado_informe IN ('enviado', 'en_revision') 
          THEN inf.id_informe 
        END) as informes_pendientes,
        
        1 as practicas_requeridas
        
      FROM siggip.estudiantes e
      
      -- ✅ LEFT JOIN para que siempre devuelva datos aunque no haya prácticas
      LEFT JOIN siggip.practicas pr 
        ON e.id_estudiante = pr.id_estudiante
        
      LEFT JOIN siggip.postulaciones po 
        ON e.id_estudiante = po.id_estudiante
        
      LEFT JOIN siggip.informes_avance inf 
        ON pr.id_practica = inf.id_practica
        
      WHERE e.id_estudiante = :id_estudiante
      GROUP BY e.id_estudiante
    `;

    const stats = await sequelize.query(statsQuery, {
      replacements: { id_estudiante },
      type: sequelize.QueryTypes.SELECT
    });

    const resultado = stats[0] || {
      practicas_completadas: 0,
      practicas_en_curso: 0,
      horas_completadas: 0,
      postulaciones_activas: 0,
      total_postulaciones: 0,
      postulaciones_aceptadas: 0,
      postulaciones_rechazadas: 0,
      postulaciones_canceladas: 0,
      informes_aprobados: 0,
      informes_pendientes: 0,
      practicas_requeridas: 1,
      tasa_aceptacion: 0
    };

    // Calcular tasa de aceptación
    resultado.tasa_aceptacion = resultado.total_postulaciones > 0
      ? Math.round((resultado.postulaciones_aceptadas / resultado.total_postulaciones) * 100)
      : 0;

    console.log('📊 Estadísticas corregidas:', {
      practicas_en_curso: resultado.practicas_en_curso,
      practicas_completadas: resultado.practicas_completadas,
      horas_completadas: resultado.horas_completadas,
      total_postulaciones: resultado.total_postulaciones,
      postulaciones_activas: resultado.postulaciones_activas
    });

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
// ==================== MIS POSTULACIONES ====================
export const obtenerMisPostulaciones = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      SELECT 
        po.id_postulacion,
        po.codigo_postulacion,
        po.fecha_postulacion,
        po.estado_postulacion,
        po.comentarios_seleccion,
        po.fecha_respuesta,
        po.carta_motivacion,
        of.id_oferta,
        of.codigo_oferta,
        of.titulo_oferta,
        of.descripcion,
        of.duracion_horas,
        of.modalidad_trabajo,
        of.ubicacion,
        of.fecha_inicio,
        of.fecha_limite_postulacion,
        of.salario_referencial,
        of.beneficios,
        emp.id_empresa,
        emp.razon_social as empresa_nombre,
        emp.nombre_comercial,
        emp.sector_economico,
        emp.comuna,
        emp.region
      FROM siggip.postulaciones po
      INNER JOIN siggip.estudiantes e ON po.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON po.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE e.id_usuario = :id_usuario
      ORDER BY po.fecha_postulacion DESC
      LIMIT 50
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener postulaciones:', error);
    return res.status(500).json({ error: 'Error al obtener postulaciones' });
  }
};

// ==================== MIS PRÁCTICAS ====================
export const obtenerMisPracticas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    // ✅ Ahora filtramos correctamente y excluimos prácticas canceladas o suspendidas
    const query = `
      SELECT 
        pr.id_practica,
        pr.codigo_practica,
        pr.fecha_inicio_practica,
        pr.fecha_termino_practica,
        pr.horas_completadas,
        pr.estado_practica,
        pr.observaciones,
        pr.fecha_asignacion,
        of.id_oferta,
        of.titulo_oferta,
        of.descripcion,
        of.requisitos,
        of.duracion_horas AS horas_requeridas,
        of.modalidad_trabajo,
        of.ubicacion,
        emp.id_empresa,
        emp.razon_social AS empresa_nombre,
        emp.nombre_comercial,
        emp.direccion AS direccion_empresa,
        emp.telefono AS telefono_empresa,
        emp.email_contacto AS email_empresa,
        pf.id_profesor,
        uProf.nombre AS profesor_nombre,
        uProf.apellido_paterno AS profesor_apellido,
        uProf.apellido_materno AS profesor_apellido_materno,
        uProf.email AS profesor_email,
        uProf.telefono AS profesor_telefono
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      LEFT JOIN siggip.profesores pf ON pr.id_profesor_guia = pf.id_profesor
      LEFT JOIN siggip.usuarios uProf ON pf.id_usuario = uProf.id_usuario
      WHERE e.id_usuario = :id_usuario
        AND pr.estado_practica NOT IN ('cancelada', 'suspendida')  -- 👈 nuevo filtro
      ORDER BY 
        CASE pr.estado_practica
          WHEN 'en_curso' THEN 1
          WHEN 'asignada' THEN 2
          WHEN 'completada' THEN 3
          ELSE 4
        END,
        pr.fecha_asignacion DESC
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    // ✅ Si el estudiante tiene más de una práctica, dejamos solo la más reciente
    let practicasUnicas = [];
    if (resultado.length > 1) {
      const mapa = new Map();
      for (const p of resultado) {
        if (!mapa.has(p.estado_practica)) mapa.set(p.estado_practica, p);
      }
      practicasUnicas = Array.from(mapa.values());
    } else {
      practicasUnicas = resultado;
    }

    console.log('✅ Prácticas válidas encontradas:', practicasUnicas.length);
    return res.json(practicasUnicas);
  } catch (error) {
    console.error('❌ Error al obtener prácticas:', error);
    return res.status(500).json({ error: 'Error al obtener prácticas' });
  }
};

// ==================== OFERTAS DISPONIBLES ====================
export const obtenerOfertasDisponibles = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const estudianteQuery = `
      SELECT id_estudiante, id_especialidad 
      FROM siggip.estudiantes 
      WHERE id_usuario = :id_usuario
    `;
    const estudianteResult = await sequelize.query(estudianteQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!estudianteResult || estudianteResult.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const { id_estudiante, id_especialidad } = estudianteResult[0];

    // ✅ CONSULTA CORREGIDA
    const query = `
      SELECT 
        of.id_oferta,
        of.codigo_oferta,
        of.titulo_oferta,
        of.descripcion,
        of.requisitos,
        of.duracion_horas,
        of.horario_trabajo,
        of.ubicacion,
        of.modalidad_trabajo,
        of.cupos_disponibles,
        of.fecha_inicio,
        of.fecha_limite_postulacion,
        of.fecha_creacion,
        of.salario_referencial,
        of.beneficios,
        of.estado_oferta,
        emp.id_empresa,
        emp.razon_social as empresa_nombre,
        emp.nombre_comercial,
        emp.sector_economico,
        emp.comuna,
        emp.region,
        -- ✅ CORRECCIÓN: Solo marcar como postulado si está en estado activo
        CASE 
          WHEN po.id_postulacion IS NOT NULL 
            AND po.estado_postulacion IN ('pendiente', 'en_revision', 'aceptada') 
          THEN true 
          ELSE false 
        END as ya_postulado,
        po.estado_postulacion
      FROM siggip.ofertas_practica of
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      LEFT JOIN siggip.postulaciones po ON of.id_oferta = po.id_oferta 
        AND po.id_estudiante = :id_estudiante
        -- ✅ NUEVO: Excluir postulaciones canceladas o rechazadas
        AND po.estado_postulacion NOT IN ('cancelada', 'rechazada')
      WHERE of.id_especialidad = :id_especialidad
        AND of.estado_oferta = 'activa'
        AND of.fecha_limite_postulacion >= CURRENT_DATE
        AND of.cupos_disponibles > 0
      ORDER BY of.fecha_creacion DESC
      LIMIT 50
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_estudiante, id_especialidad },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener ofertas:', error);
    return res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};

// ==================== MIS INFORMES ====================
export const obtenerMisInformes = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      SELECT 
        inf.id_informe,
        inf.numero_informe,
        inf.codigo_informe,
        inf.titulo_informe,
        inf.actividades_realizadas,
        inf.aprendizajes_obtenidos,
        inf.dificultades_encontradas,
        inf.horas_registradas,
        inf.fecha_envio,
        inf.fecha_revision,
        inf.estado_informe,
        inf.comentarios_profesor,
        pr.id_practica,
        pr.codigo_practica,
        pr.estado_practica,
        of.titulo_oferta,
        emp.razon_social as empresa_nombre
      FROM siggip.informes_avance inf
      INNER JOIN siggip.practicas pr ON inf.id_practica = pr.id_practica
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE e.id_usuario = :id_usuario
      ORDER BY inf.fecha_envio DESC
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener informes:', error);
    return res.status(500).json({ error: 'Error al obtener informes' });
  }
};

// ==================== MI PLAN DE PRÁCTICA ====================
export const obtenerMiPlanPractica = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const practicaQuery = `
      SELECT 
        pr.id_practica,
        pr.codigo_practica,
        pr.fecha_inicio_practica,
        pr.fecha_termino_practica,
        pr.estado_practica,
        pr.horas_completadas,
        emp.razon_social as empresa_nombre,
        of.titulo_oferta,
        of.duracion_horas as horas_requeridas
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE e.id_usuario = :id_usuario
        AND pr.estado_practica IN ('asignada', 'en_curso')
      ORDER BY pr.fecha_asignacion DESC
      LIMIT 1
    `;

    const practica = await sequelize.query(practicaQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!practica || practica.length === 0) {
      return res.json({ 
        tiene_plan: false,
        mensaje: 'No tienes una práctica activa actualmente' 
      });
    }

    const id_practica = practica[0].id_practica;

    const planQuery = `
      SELECT 
        pp.id_plan_practica,
        pp.codigo_plan,
        pp.fecha_creacion,
        pp.fecha_firma,
        pp.estado_plan,
        pp.establecimiento_nombre,
        pp.maestro_guia_nombre,
        pp.maestro_guia_cargo,
        pp.maestro_guia_email,
        pp.maestro_guia_telefono,
        pp.observaciones
      FROM siggip.planes_practica pp
      WHERE pp.id_practica = :id_practica
    `;

    const plan = await sequelize.query(planQuery, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    if (!plan || plan.length === 0) {
      return res.json({
        tiene_plan: false,
        practica: practica[0],
        mensaje: 'Tu práctica aún no tiene plan asignado'
      });
    }

    const areasQuery = `
      SELECT 
        ac.id_area_competencia,
        ac.codigo_area,
        ac.nombre_area,
        ac.descripcion as descripcion_area,
        ac.orden_visualizacion
      FROM siggip.areas_competencia ac
      INNER JOIN siggip.especialidades esp ON ac.id_especialidad = esp.id_especialidad
      INNER JOIN siggip.estudiantes e ON e.id_especialidad = esp.id_especialidad
      INNER JOIN siggip.usuarios u ON e.id_usuario = u.id_usuario
      WHERE u.id_usuario = :id_usuario
        AND ac.estado = 'activo'
      ORDER BY ac.orden_visualizacion
    `;

    const areas = await sequelize.query(areasQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    const id_plan_practica = plan[0].id_plan_practica;
    
    for (let area of areas) {
      const tareasQuery = `
        SELECT 
          t.id_tarea,
          t.codigo_tarea,
          t.descripcion_tarea,
          t.es_obligatoria,
          t.orden_secuencia,
          ppt.id_plan_tarea,
          ppt.seleccionada,
          ppt.nivel_logro_esperado,
          ppt.observaciones,
          COALESCE(et.nivel_logro, NULL) as nivel_logro_actual,
          COALESCE(et.fue_realizada, false) as fue_realizada,
          et.comentarios as comentarios_evaluacion,
          et.fecha_evaluacion
        FROM siggip.tareas_competencia t
        LEFT JOIN siggip.plan_practica_tareas ppt 
          ON t.id_tarea = ppt.id_tarea 
          AND ppt.id_plan_practica = :id_plan_practica
        LEFT JOIN siggip.evaluaciones_tareas et 
          ON t.id_tarea = et.id_tarea 
          AND et.id_practica = :id_practica
        WHERE t.id_area_competencia = :id_area_competencia
          AND t.estado = 'activo'
        ORDER BY t.orden_secuencia
      `;

      const tareas = await sequelize.query(tareasQuery, {
        replacements: { 
          id_area_competencia: area.id_area_competencia,
          id_plan_practica,
          id_practica
        },
        type: sequelize.QueryTypes.SELECT
      });

      area.tareas = tareas;
      area.total_tareas = tareas.length;
      area.tareas_completadas = tareas.filter(t => t.fue_realizada).length;
      area.progreso = area.total_tareas > 0 
        ? Math.round((area.tareas_completadas / area.total_tareas) * 100) 
        : 0;
    }

    const competenciasQuery = `
      SELECT 
        ce.id_competencia_empleabilidad,
        ce.codigo_competencia,
        ce.nombre_competencia,
        ce.descripcion,
        ce.orden_visualizacion,
        COALESCE(ee.nivel_logro, NULL) as nivel_logro,
        ee.observaciones as observaciones_evaluacion,
        ee.evaluador_tipo,
        ee.fecha_evaluacion
      FROM siggip.competencias_empleabilidad ce
      LEFT JOIN siggip.evaluaciones_empleabilidad ee 
        ON ce.id_competencia_empleabilidad = ee.id_competencia_empleabilidad
        AND ee.id_practica = :id_practica
      WHERE ce.estado = 'activo'
      ORDER BY ce.orden_visualizacion
    `;

    const competencias = await sequelize.query(competenciasQuery, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    const total_tareas = areas.reduce((sum, area) => sum + area.total_tareas, 0);
    const tareas_completadas = areas.reduce((sum, area) => sum + area.tareas_completadas, 0);
    const progreso_general = total_tareas > 0 
      ? Math.round((tareas_completadas / total_tareas) * 100) 
      : 0;

    return res.json({
      tiene_plan: true,
      practica: practica[0],
      plan: plan[0],
      areas_competencia: areas,
      competencias_empleabilidad: competencias,
      resumen: {
        total_areas: areas.length,
        total_tareas,
        tareas_completadas,
        tareas_pendientes: total_tareas - tareas_completadas,
        progreso_general,
        competencias_evaluadas: competencias.filter(c => c.nivel_logro !== null).length,
        total_competencias: competencias.length
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener plan de práctica:', error);
    return res.status(500).json({ error: 'Error al obtener plan de práctica' });
  }
};

// ==================== MIS EVALUACIONES ====================
export const obtenerMisEvaluaciones = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const practicaQuery = `
      SELECT pr.id_practica
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE e.id_usuario = :id_usuario
        AND pr.estado_practica IN ('asignada', 'en_curso', 'completada')
      ORDER BY pr.fecha_asignacion DESC
      LIMIT 1
    `;

    const practica = await sequelize.query(practicaQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!practica || practica.length === 0) {
      return res.json({
        tiene_evaluaciones: false,
        mensaje: 'No tienes evaluaciones disponibles'
      });
    }

    const id_practica = practica[0].id_practica;

    const areasQuery = `
      SELECT 
        eac.id_evaluacion_area,
        eac.calificacion,
        eac.comentarios,
        eac.evaluador_tipo,
        eac.fecha_evaluacion,
        ac.nombre_area,
        ac.descripcion as area_descripcion
      FROM siggip.evaluaciones_areas_competencia eac
      INNER JOIN siggip.areas_competencia ac ON eac.id_area_competencia = ac.id_area_competencia
      WHERE eac.id_practica = :id_practica
      ORDER BY eac.fecha_evaluacion DESC
    `;

    const evaluaciones_areas = await sequelize.query(areasQuery, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    const empleabilidadQuery = `
      SELECT 
        ee.id_evaluacion_empleabilidad,
        ee.nivel_logro,
        ee.observaciones,
        ee.evaluador_tipo,
        ee.fecha_evaluacion,
        ce.nombre_competencia,
        ce.descripcion as competencia_descripcion
      FROM siggip.evaluaciones_empleabilidad ee
      INNER JOIN siggip.competencias_empleabilidad ce 
        ON ee.id_competencia_empleabilidad = ce.id_competencia_empleabilidad
      WHERE ee.id_practica = :id_practica
      ORDER BY ce.orden_visualizacion
    `;

    const evaluaciones_empleabilidad = await sequelize.query(empleabilidadQuery, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    const finalQuery = `
      SELECT 
        ef.id_evaluacion,
        ef.calificacion_empresa,
        ef.comentarios_empresa,
        ef.fecha_evaluacion_empresa,
        ef.calificacion_profesor,
        ef.comentarios_profesor,
        ef.fecha_evaluacion_profesor,
        ef.calificacion_final,
        ef.validado_directivo,
        ef.comentarios_directivo,
        ef.fecha_validacion,
        ef.estado_evaluacion
      FROM siggip.evaluaciones_finales ef
      WHERE ef.id_practica = :id_practica
    `;

    const evaluacion_final = await sequelize.query(finalQuery, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    const promedio_areas = evaluaciones_areas.length > 0
      ? (evaluaciones_areas.reduce((sum, ev) => sum + parseFloat(ev.calificacion), 0) / evaluaciones_areas.length).toFixed(2)
      : null;

    return res.json({
      tiene_evaluaciones: true,
      evaluaciones_areas_competencia: evaluaciones_areas,
      evaluaciones_empleabilidad: evaluaciones_empleabilidad,
      evaluacion_final: evaluacion_final.length > 0 ? evaluacion_final[0] : null,
      resumen: {
        total_areas_evaluadas: evaluaciones_areas.length,
        promedio_areas: promedio_areas,
        total_competencias_evaluadas: evaluaciones_empleabilidad.length,
        tiene_evaluacion_final: evaluacion_final.length > 0
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener evaluaciones:', error);
    return res.status(500).json({ error: 'Error al obtener evaluaciones' });
  }
};

// ==================== BITÁCORA DE ACTIVIDADES ====================
export const obtenerMiBitacora = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_practica } = req.params;

    const verificarQuery = `
      SELECT pr.id_practica
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE pr.id_practica = :id_practica
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_practica, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta bitácora' });
    }

    // ✅ CONSULTA CORREGIDA con los campos reales de la BD
    const query = `
      SELECT 
        b.id_bitacora,
        b.fecha_actividad,
        b.duracion_horas,
        b.descripcion_actividad,
        b.equipos_utilizados,
        b.herramientas_utilizadas,
        b.normas_seguridad_aplicadas,
        b.observaciones,
        b.validado_por_empresa,
        b.fecha_registro
      FROM siggip.bitacora_actividades b
      WHERE b.id_practica = :id_practica
      ORDER BY b.fecha_actividad DESC
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_practica },
      type: sequelize.QueryTypes.SELECT
    });

    const total_horas = resultado.reduce((sum, registro) => sum + (parseFloat(registro.duracion_horas) || 0), 0);
    const total_registros = resultado.length;

    return res.json({
      bitacora: resultado,
      resumen: {
        total_registros,
        total_horas,
        ultimo_registro: resultado.length > 0 ? resultado[0].fecha_actividad : null
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener bitácora:', error);
    return res.status(500).json({ error: 'Error al obtener bitácora' });
  }
};

export const registrarActividadBitacora = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_practica } = req.params;
    const { 
      fecha_actividad, 
      duracion_horas,  // ✅ CORREGIDO: era "horas_trabajadas"
      descripcion_actividad,  // ✅ CORREGIDO: era "actividades_realizadas"
      equipos_utilizados,  // ✅ NUEVO: campo que existe en BD
      herramientas_utilizadas,  // ✅ NUEVO: campo que existe en BD
      normas_seguridad_aplicadas,  // ✅ NUEVO: campo que existe en BD
      observaciones
    } = req.body;

    // Validar campos obligatorios
    if (!fecha_actividad || !duracion_horas || !descripcion_actividad) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: fecha_actividad, duracion_horas, descripcion_actividad' 
      });
    }

    const verificarQuery = `
      SELECT pr.id_practica
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE pr.id_practica = :id_practica
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_practica, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para registrar en esta bitácora' });
    }

    // ✅ CONSULTA CORREGIDA con los campos correctos
    const insertQuery = `
      INSERT INTO siggip.bitacora_actividades (
        id_practica,
        fecha_actividad,
        duracion_horas,
        descripcion_actividad,
        equipos_utilizados,
        herramientas_utilizadas,
        normas_seguridad_aplicadas,
        observaciones,
        validado_por_empresa,
        fecha_registro
      ) VALUES (
        :id_practica,
        :fecha_actividad,
        :duracion_horas,
        :descripcion_actividad,
        :equipos_utilizados,
        :herramientas_utilizadas,
        :normas_seguridad_aplicadas,
        :observaciones,
        false,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const resultado = await sequelize.query(insertQuery, {
      replacements: {
        id_practica,
        fecha_actividad,
        duracion_horas,
        descripcion_actividad,
        equipos_utilizados: equipos_utilizados || null,
        herramientas_utilizadas: herramientas_utilizadas || null,
        normas_seguridad_aplicadas: normas_seguridad_aplicadas || null,
        observaciones: observaciones || null
      },
      type: sequelize.QueryTypes.INSERT
    });

    return res.json({
      success: true,
      message: 'Actividad registrada exitosamente',
      data: resultado[0][0]
    });
  } catch (error) {
    console.error('❌ Error al registrar actividad:', error);
    return res.status(500).json({ error: 'Error al registrar actividad' });
  }
};

export const actualizarActividadBitacora = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_practica, id_bitacora } = req.params;
    const { 
      fecha_actividad, 
      duracion_horas,  // ✅ CORREGIDO
      descripcion_actividad,  // ✅ CORREGIDO
      equipos_utilizados,
      herramientas_utilizadas,
      normas_seguridad_aplicadas,
      observaciones
    } = req.body;

    const verificarQuery = `
      SELECT b.id_bitacora
      FROM siggip.bitacora_actividades b
      INNER JOIN siggip.practicas pr ON b.id_practica = pr.id_practica
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE b.id_bitacora = :id_bitacora
        AND b.id_practica = :id_practica
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_bitacora, id_practica, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para editar este registro' });
    }

    // ✅ CONSULTA CORREGIDA
    const updateQuery = `
      UPDATE siggip.bitacora_actividades
      SET 
        fecha_actividad = :fecha_actividad,
        duracion_horas = :duracion_horas,
        descripcion_actividad = :descripcion_actividad,
        equipos_utilizados = :equipos_utilizados,
        herramientas_utilizadas = :herramientas_utilizadas,
        normas_seguridad_aplicadas = :normas_seguridad_aplicadas,
        observaciones = :observaciones
      WHERE id_bitacora = :id_bitacora
      RETURNING *
    `;

    await sequelize.query(updateQuery, {
      replacements: {
        id_bitacora,
        fecha_actividad,
        duracion_horas,
        descripcion_actividad,
        equipos_utilizados: equipos_utilizados || null,
        herramientas_utilizadas: herramientas_utilizadas || null,
        normas_seguridad_aplicadas: normas_seguridad_aplicadas || null,
        observaciones: observaciones || null
      },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.json({
      success: true,
      message: 'Actividad actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar actividad:', error);
    return res.status(500).json({ error: 'Error al actualizar actividad' });
  }
};

export const eliminarActividadBitacora = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_practica, id_bitacora } = req.params;

    const verificarQuery = `
      SELECT b.id_bitacora
      FROM siggip.bitacora_actividades b
      INNER JOIN siggip.practicas pr ON b.id_practica = pr.id_practica
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE b.id_bitacora = :id_bitacora
        AND b.id_practica = :id_practica
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_bitacora, id_practica, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este registro' });
    }

    const deleteQuery = `
      DELETE FROM siggip.bitacora_actividades
      WHERE id_bitacora = :id_bitacora
    `;

    await sequelize.query(deleteQuery, {
      replacements: { id_bitacora },
      type: sequelize.QueryTypes.DELETE
    });

    return res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar actividad:', error);
    return res.status(500).json({ error: 'Error al eliminar actividad' });
  }
};

// ==================== NOTIFICACIONES ====================
export const obtenerNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      SELECT 
        n.id_notificacion,
        n.tipo_notificacion as tipo,
        n.titulo,
        n.mensaje,
        n.leida,
        n.fecha_creacion,
        n.fecha_leida,
        n.url_relacionada
      FROM siggip.notificaciones n
      WHERE n.id_usuario_destinatario = :id_usuario
      ORDER BY n.fecha_creacion DESC
      LIMIT 50
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    const no_leidas = resultado.filter(n => !n.leida).length;

    return res.json({
      notificaciones: resultado,
      total: resultado.length,
      no_leidas
    });
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

export const marcarNotificacionLeida = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id } = req.params;

    const query = `
      UPDATE siggip.notificaciones
      SET 
        leida = true,
        fecha_leida = CURRENT_TIMESTAMP
      WHERE id_notificacion = :id
        AND id_usuario_destinatario = :id_usuario
    `;

    await sequelize.query(query, {
      replacements: { id, id_usuario },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.json({ 
      success: true, 
      message: 'Notificación marcada como leída' 
    });
  } catch (error) {
    console.error('❌ Error al marcar notificación:', error);
    return res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

export const marcarTodasNotificacionesLeidas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      UPDATE siggip.notificaciones
      SET 
        leida = true,
        fecha_leida = CURRENT_TIMESTAMP
      WHERE id_usuario_destinatario = :id_usuario
        AND leida = false
    `;

    await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.json({ 
      success: true, 
      message: 'Todas las notificaciones marcadas como leídas' 
    });
  } catch (error) {
    console.error('❌ Error al marcar notificaciones:', error);
    return res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
};

// ==================== SUBIR INFORME ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'informes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'informe-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

export const uploadMiddleware = upload.single('archivo');

export const subirInforme = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id } = req.params;
    const { 
      numero_informe, 
      titulo_informe,
      actividades_realizadas,
      aprendizajes_obtenidos,
      dificultades_encontradas,
      horas_registradas
    } = req.body;

    // Validar campos obligatorios
    if (!numero_informe || !titulo_informe || !actividades_realizadas || !aprendizajes_obtenidos || !horas_registradas) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: numero_informe, titulo_informe, actividades_realizadas, aprendizajes_obtenidos, horas_registradas' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const verificarQuery = `
      SELECT pr.id_practica, e.id_estudiante
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      WHERE pr.id_practica = :id_practica
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_practica: id, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ error: 'No tienes permisos para subir informes a esta práctica' });
    }

    const contarQuery = `
      SELECT COUNT(*) as total
      FROM siggip.informes_avance
      WHERE id_practica = :id_practica
    `;

    const conteo = await sequelize.query(contarQuery, {
      replacements: { id_practica: id },
      type: sequelize.QueryTypes.SELECT
    });

    if (parseInt(conteo[0].total) >= 3) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Ya has subido el máximo de 3 informes permitidos' });
    }

    const codigo_informe = `INF-${Date.now()}`;

    const insertQuery = `
      INSERT INTO siggip.informes_avance (
        id_practica,
        numero_informe,
        codigo_informe,
        titulo_informe,
        actividades_realizadas,
        aprendizajes_obtenidos,
        dificultades_encontradas,
        horas_registradas,
        fecha_envio,
        estado_informe
      ) VALUES (
        :id_practica,
        :numero_informe,
        :codigo_informe,
        :titulo_informe,
        :actividades_realizadas,
        :aprendizajes_obtenidos,
        :dificultades_encontradas,
        :horas_registradas,
        CURRENT_TIMESTAMP,
        'enviado'
      )
      RETURNING *
    `;

    const resultado = await sequelize.query(insertQuery, {
      replacements: {
        id_practica: id,
        numero_informe,
        codigo_informe,
        titulo_informe,
        actividades_realizadas,
        aprendizajes_obtenidos,
        dificultades_encontradas: dificultades_encontradas || null,
        horas_registradas
      },
      type: sequelize.QueryTypes.INSERT
    });

    // Notificar al profesor guía - solo si hay campo url_relacionada
    const notifQuery = `
      INSERT INTO siggip.notificaciones (
        id_usuario_destinatario,
        tipo_notificacion,
        titulo,
        mensaje,
        leida,
        fecha_creacion
      )
      SELECT 
        prof.id_usuario,
        'informe_enviado',
        'Nuevo informe subido',
        CONCAT('El estudiante ha subido el informe #', :numero_informe, ': ', :titulo_informe),
        false,
        CURRENT_TIMESTAMP
      FROM siggip.practicas pr
      INNER JOIN siggip.profesores pf ON pr.id_profesor_guia = pf.id_profesor
      WHERE pr.id_practica = :id_practica
        AND prof.id_usuario IS NOT NULL
    `;

    await sequelize.query(notifQuery, {
      replacements: { 
        numero_informe, 
        titulo_informe,
        id_practica: id 
      },
      type: sequelize.QueryTypes.INSERT
    }).catch(err => {
      console.error('⚠️ Error al crear notificación (no crítico):', err.message);
    });

    return res.json({
      success: true,
      message: 'Informe subido exitosamente',
      data: resultado[0]
    });
  } catch (error) {
    console.error('❌ Error al subir informe:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: 'Error al subir informe' });
  }
};

// ==================== POSTULAR A OFERTA ====================
export const postularAOferta = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_oferta } = req.params;
    let { carta_motivacion } = req.body;

    console.log('📨 Intentando postular:', { id_usuario, id_oferta, carta_motivacion });

    // Obtener datos del estudiante
    const estudianteQuery = `
      SELECT id_estudiante, id_especialidad 
      FROM siggip.estudiantes 
      WHERE id_usuario = :id_usuario
    `;
    const estudianteResult = await sequelize.query(estudianteQuery, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!estudianteResult || estudianteResult.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const id_estudiante = estudianteResult[0].id_estudiante;

    // Verificar si la oferta existe y está activa
    const ofertaQuery = `
      SELECT id_oferta, titulo_oferta, estado_oferta, fecha_limite_postulacion, cupos_disponibles
      FROM siggip.ofertas_practica
      WHERE id_oferta = :id_oferta
    `;
    const ofertaResult = await sequelize.query(ofertaQuery, {
      replacements: { id_oferta },
      type: sequelize.QueryTypes.SELECT
    });

    if (!ofertaResult || ofertaResult.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    const oferta = ofertaResult[0];

    // Validar que la oferta esté activa
    if (oferta.estado_oferta !== 'activa') {
      return res.status(400).json({ error: 'Esta oferta ya no está disponible' });
    }

    // Validar fecha límite
    if (new Date(oferta.fecha_limite_postulacion) < new Date()) {
      return res.status(400).json({ error: 'La fecha límite para postular ha expirado' });
    }

    // Validar cupos disponibles
    if (oferta.cupos_disponibles <= 0) {
      return res.status(400).json({ error: 'No quedan cupos disponibles para esta oferta' });
    }

    // Verificar si ya postuló
    const verificarQuery = `
      SELECT id_postulacion, estado_postulacion
      FROM siggip.postulaciones 
      WHERE id_estudiante = :id_estudiante 
        AND id_oferta = :id_oferta
    `;

    const yaPostulo = await sequelize.query(verificarQuery, {
      replacements: { id_estudiante, id_oferta },
      type: sequelize.QueryTypes.SELECT
    });

    if (yaPostulo && yaPostulo.length > 0) {
      return res.status(400).json({ 
        error: 'Ya has postulado a esta oferta',
        estado: yaPostulo[0].estado_postulacion
      });
    }

    // Verificar si tiene una práctica activa
    const practicaActivaQuery = `
      SELECT id_practica, estado_practica
      FROM siggip.practicas 
      WHERE id_estudiante = :id_estudiante 
        AND estado_practica IN ('asignada', 'en_curso')
    `;

    const practicaActiva = await sequelize.query(practicaActivaQuery, {
      replacements: { id_estudiante },
      type: sequelize.QueryTypes.SELECT
    });

    if (practicaActiva && practicaActiva.length > 0) {
      return res.status(400).json({ 
        error: 'Ya tienes una práctica activa. Solo puedes tener una práctica a la vez.',
        practica_actual: practicaActiva[0]
      });
    }

    // Validar carta de motivación (más flexible)
    if (!carta_motivacion || carta_motivacion.trim().length < 50) {
      return res.status(400).json({ 
        error: 'La carta de motivación debe tener al menos 50 caracteres',
        actual: carta_motivacion ? carta_motivacion.length : 0
      });
    }

    // Limpiar y limitar la carta de motivación
    carta_motivacion = carta_motivacion.trim().substring(0, 1000);

    // Generar código único para la postulación
    const codigo_postulacion = `POST-${Date.now()}-${id_estudiante}`;

    console.log('✅ Validaciones pasadas, insertando postulación...');

    // Insertar postulación
    const insertQuery = `
      INSERT INTO siggip.postulaciones (
        id_estudiante,
        id_oferta,
        codigo_postulacion,
        carta_motivacion,
        fecha_postulacion,
        estado_postulacion
      ) VALUES (
        :id_estudiante,
        :id_oferta,
        :codigo_postulacion,
        :carta_motivacion,
        CURRENT_TIMESTAMP,
        'pendiente'
      )
      RETURNING id_postulacion, codigo_postulacion, fecha_postulacion, estado_postulacion
    `;

    const resultado = await sequelize.query(insertQuery, {
      replacements: {
        id_estudiante,
        id_oferta,
        codigo_postulacion,
        carta_motivacion
      },
      type: sequelize.QueryTypes.INSERT
    });

    console.log('✅ Postulación creada:', resultado[0]);

    // Notificar a la empresa - solo si hay campo url_relacionada en BD
    try {
      const notifQuery = `
        INSERT INTO siggip.notificaciones (
          id_usuario_destinatario,
          tipo_notificacion,
          titulo,
          mensaje,
          leida,
          fecha_creacion
        )
        SELECT 
          ue.id_usuario,
          'postulacion_recibida',
          'Nueva postulación recibida',
          CONCAT('Un estudiante ha postulado a la oferta: ', :titulo_oferta),
          false,
          CURRENT_TIMESTAMP
        FROM siggip.ofertas_practica of
        INNER JOIN siggip.usuarios_empresa ue ON of.id_empresa = ue.id_empresa
        WHERE of.id_oferta = :id_oferta
          AND ue.es_contacto_principal = true
        LIMIT 1
      `;

      await sequelize.query(notifQuery, {
        replacements: { id_oferta, titulo_oferta: oferta.titulo_oferta },
        type: sequelize.QueryTypes.INSERT
      });
    } catch (notifError) {
      console.error('⚠️ Error al crear notificación (no crítico):', notifError.message);
    }

    return res.json({
      success: true,
      message: 'Postulación enviada exitosamente',
      data: {
        id_postulacion: resultado[0][0].id_postulacion,
        codigo_postulacion: resultado[0][0].codigo_postulacion,
        fecha_postulacion: resultado[0][0].fecha_postulacion,
        estado: resultado[0][0].estado_postulacion
      }
    });
  } catch (error) {
    console.error('❌ Error al postular:', error);
    return res.status(500).json({ 
      error: 'Error al enviar postulación',
      detalles: error.message 
    });
  }
};

// ==================== CANCELAR POSTULACIÓN ====================
export const cancelarPostulacion = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { id_postulacion } = req.params;

    const verificarQuery = `
      SELECT po.id_postulacion, po.estado_postulacion
      FROM siggip.postulaciones po
      INNER JOIN siggip.estudiantes e ON po.id_estudiante = e.id_estudiante
      WHERE po.id_postulacion = :id_postulacion
        AND e.id_usuario = :id_usuario
    `;

    const verificacion = await sequelize.query(verificarQuery, {
      replacements: { id_postulacion, id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    if (!verificacion || verificacion.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar esta postulación' });
    }

    if (verificacion[0].estado_postulacion !== 'pendiente' && verificacion[0].estado_postulacion !== 'en_revision') {
      return res.status(400).json({ error: 'Solo puedes cancelar postulaciones pendientes o en revisión' });
    }

    const updateQuery = `
      UPDATE siggip.postulaciones
      SET estado_postulacion = 'cancelada'
      WHERE id_postulacion = :id_postulacion
    `;

    await sequelize.query(updateQuery, {
      replacements: { id_postulacion },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.json({
      success: true,
      message: 'Postulación cancelada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al cancelar postulación:', error);
    return res.status(500).json({ error: 'Error al cancelar postulación' });
  }
};

// ==================== ACTUALIZAR PERFIL ====================
export const actualizarPerfil = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;
    const { telefono, direccion } = req.body;

    const updateQuery = `
      UPDATE siggip.usuarios
      SET 
        telefono = COALESCE(:telefono, telefono),
        direccion = COALESCE(:direccion, direccion)
      WHERE id_usuario = :id_usuario
      RETURNING *
    `;

    await sequelize.query(updateQuery, {
      replacements: {
        id_usuario,
        telefono: telefono || null,
        direccion: direccion || null
      },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};