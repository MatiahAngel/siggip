// 📁 UBICACIÓN: backend/src/controladores/estudiantes/ctrl.js
// 🎯 Controladores para estudiantes - Usando modelos Sequelize

import { sequelize } from '../../configuracion/baseDatos.js';

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
        e.id_estudiante,
        e.codigo_estudiante,
        e.nivel_academico,
        e.promedio_notas,
        e.ano_ingreso,
        e.ano_egreso,
        e.estado_estudiante,
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

export const obtenerEstadisticasEstudiante = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    // Obtener el id_estudiante
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

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN pr.estado_practica = 'completada' THEN 1 END) as practicas_completadas,
        COUNT(CASE WHEN pr.estado_practica IN ('asignada', 'en_curso') THEN 1 END) as practicas_en_curso,
        COALESCE(SUM(CASE WHEN pr.estado_practica IN ('en_curso', 'completada') THEN pr.horas_completadas ELSE 0 END), 0) as horas_completadas,
        COUNT(DISTINCT po.id_postulacion) as postulaciones_activas
      FROM siggip.estudiantes e
      LEFT JOIN siggip.practicas pr ON e.id_estudiante = pr.id_estudiante
      LEFT JOIN siggip.postulaciones po ON e.id_estudiante = po.id_estudiante 
        AND po.estado_postulacion IN ('pendiente', 'en_revision')
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
      postulaciones_activas: 0
    };

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

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
        of.id_oferta,
        of.titulo_oferta,
        of.duracion_horas,
        of.modalidad_trabajo,
        of.ubicacion,
        of.fecha_limite_postulacion,
        emp.razon_social as empresa_nombre,
        emp.sector_economico
      FROM siggip.postulaciones po
      INNER JOIN siggip.estudiantes e ON po.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON po.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      WHERE e.id_usuario = :id_usuario
      ORDER BY po.fecha_postulacion DESC
      LIMIT 20
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

export const obtenerMisPracticas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    const query = `
      SELECT 
        pr.id_practica,
        pr.codigo_practica,
        pr.fecha_inicio_practica,
        pr.fecha_termino_practica,
        pr.horas_completadas,
        pr.estado_practica,
        pr.observaciones,
        of.titulo_oferta,
        of.duracion_horas as horas_requeridas,
        emp.razon_social as empresa_nombre,
        emp.direccion as empresa_direccion,
        emp.telefono as empresa_telefono,
        prof.nombre as profesor_nombre,
        prof.apellido_paterno as profesor_apellido
      FROM siggip.practicas pr
      INNER JOIN siggip.estudiantes e ON pr.id_estudiante = e.id_estudiante
      INNER JOIN siggip.ofertas_practica of ON pr.id_oferta = of.id_oferta
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      LEFT JOIN siggip.profesores pf ON pr.id_profesor_guia = pf.id_profesor
      LEFT JOIN siggip.usuarios prof ON pf.id_usuario = prof.id_usuario
      WHERE e.id_usuario = :id_usuario
      ORDER BY pr.fecha_asignacion DESC
    `;

    const resultado = await sequelize.query(query, {
      replacements: { id_usuario },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener prácticas:', error);
    return res.status(500).json({ error: 'Error al obtener prácticas' });
  }
};

export const obtenerOfertasDisponibles = async (req, res) => {
  try {
    const id_usuario = req.usuario.id;

    // Obtener la especialidad del estudiante
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

    // Obtener ofertas disponibles
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
        of.salario_referencial,
        of.beneficios,
        emp.razon_social as empresa_nombre,
        emp.sector_economico,
        emp.comuna,
        emp.region,
        CASE WHEN po.id_postulacion IS NOT NULL THEN true ELSE false END as ya_postulado
      FROM siggip.ofertas_practica of
      INNER JOIN siggip.empresas emp ON of.id_empresa = emp.id_empresa
      LEFT JOIN siggip.postulaciones po ON of.id_oferta = po.id_oferta 
        AND po.id_estudiante = :id_estudiante
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