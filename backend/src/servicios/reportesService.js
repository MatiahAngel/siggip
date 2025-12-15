import { sequelize } from '../modelos/index.js';
import { QueryTypes } from 'sequelize';

function resolveYear(anio) {
  const currentYear = new Date().getFullYear();
  const y = Number(anio);
  if (!anio || Number.isNaN(y) || `${anio}`.length !== 4) return `${currentYear}`;
  return `${y}`;
}

export async function obtenerResumenReportes(anio) {
  const year = resolveYear(anio);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const searchPath = 'siggip';

  // Verificar existencia de tablas requeridas en el esquema
  const tablesCheck = await sequelize.query(
    `SELECT 
      to_regclass('siggip.estudiantes') AS estudiantes,
      to_regclass('siggip.especialidades') AS especialidades,
      to_regclass('siggip.practicas') AS practicas,
      to_regclass('siggip.informes_avance') AS informes_avance,
      to_regclass('siggip.evaluaciones_finales') AS evaluaciones_finales,
      to_regclass('siggip.empresas') AS empresas,
      to_regclass('siggip.ofertas_practica') AS ofertas_practica,
      to_regclass('siggip.postulaciones') AS postulaciones
    `,
    { type: QueryTypes.SELECT, searchPath }
  );
  const t = tablesCheck?.[0] || {};
  const has = {
    estudiantes: !!t.estudiantes,
    especialidades: !!t.especialidades,
    practicas: !!t.practicas,
    informes_avance: !!t.informes_avance,
    evaluaciones_finales: !!t.evaluaciones_finales,
    empresas: !!t.empresas,
    ofertas_practica: !!t.ofertas_practica,
    postulaciones: !!t.postulaciones,
  };

  const coberturaSql = `
    WITH estudiantes_del_anio AS (
      SELECT e.id_estudiante, e.id_especialidad
      FROM siggip.estudiantes e
      WHERE e.ano_egreso = :year::int
    ),
    estudiantes_con_practica AS (
      SELECT DISTINCT p.id_estudiante
      FROM siggip.practicas p
      WHERE p.fecha_asignacion BETWEEN :yearStart::date AND :yearEnd::date
    ),
    resumen_por_especialidad AS (
      SELECT 
        esp.id_especialidad,
        esp.nombre_especialidad,
        COUNT(eda.id_estudiante) AS total_estudiantes,
        COUNT(CASE WHEN ecp.id_estudiante IS NOT NULL THEN 1 END) AS con_practica
      FROM estudiantes_del_anio eda
      JOIN siggip.especialidades esp ON esp.id_especialidad = eda.id_especialidad
      LEFT JOIN estudiantes_con_practica ecp ON ecp.id_estudiante = eda.id_estudiante
      GROUP BY esp.id_especialidad, esp.nombre_especialidad
    )
    SELECT 
      (SELECT COALESCE(SUM(total_estudiantes),0) FROM resumen_por_especialidad) AS total_estudiantes,
      (SELECT COALESCE(SUM(con_practica),0) FROM resumen_por_especialidad) AS total_con_practica,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id_especialidad', id_especialidad,
          'nombre_especialidad', nombre_especialidad,
          'total_estudiantes', total_estudiantes,
          'con_practica', con_practica,
          'porcentaje', CASE 
            WHEN total_estudiantes = 0 THEN 0
            ELSE ROUND((con_practica::numeric / total_estudiantes::numeric) * 100, 2)
          END
        )
      ) AS detalle
    FROM resumen_por_especialidad;
  `;

  const tiempoRevisionSql = `
    SELECT 
      ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (i.fecha_revision - i.fecha_envio)) / 86400), 0)::numeric, 2) AS promedio_dias
    FROM siggip.informes_avance i
    WHERE i.fecha_envio BETWEEN :yearStart::timestamp AND :yearEnd::timestamp
      AND i.fecha_revision IS NOT NULL
      AND i.fecha_envio IS NOT NULL;
  `;

  const tiempoValidacionSql = `
    SELECT 
      ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (ef.fecha_validacion - p.fecha_termino_practica)) / 86400), 0)::numeric, 2) AS promedio_dias
    FROM siggip.evaluaciones_finales ef
    JOIN siggip.practicas p ON p.id_practica = ef.id_practica
    WHERE ef.validado_directivo = TRUE
      AND p.fecha_termino_practica BETWEEN :yearStart::date AND :yearEnd::date
      AND ef.fecha_validacion IS NOT NULL
      AND p.fecha_termino_practica IS NOT NULL;
  `;

  const participacionEmpresarialSql = `
    WITH practicas_del_anio AS (
      SELECT p.*
      FROM siggip.practicas p
      WHERE p.fecha_asignacion BETWEEN :yearStart::date AND :yearEnd::date
    ),
    practicas_con_empresa AS (
      SELECT 
        p.id_practica,
        op.id_empresa
      FROM practicas_del_anio p
      JOIN siggip.ofertas_practica op ON op.id_oferta = p.id_oferta
    ),
    conteo_por_empresa AS (
      SELECT 
        emp.id_empresa,
        emp.razon_social,
        COUNT(pce.id_practica) AS cantidad_practicas
      FROM practicas_con_empresa pce
      JOIN siggip.empresas emp ON emp.id_empresa = pce.id_empresa
      GROUP BY emp.id_empresa, emp.razon_social
    )
    SELECT 
      (SELECT COUNT(*) FROM conteo_por_empresa) AS empresas_participantes,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id_empresa', id_empresa,
          'razon_social', razon_social,
          'cantidad_practicas', cantidad_practicas
        )
        ORDER BY cantidad_practicas DESC, razon_social ASC
      ) AS top_empresas
    FROM conteo_por_empresa;
  `;
  // Ejecutar consultas solo si las tablas requeridas existen
  const promises = [];
  if (has.estudiantes && has.especialidades && has.practicas) {
    promises.push(
      sequelize.query(coberturaSql, { type: QueryTypes.SELECT, replacements: { year, yearStart, yearEnd }, searchPath })
    );
  } else {
    promises.push(Promise.resolve([{ total_estudiantes: 0, total_con_practica: 0, detalle: [] }]));
    console.warn('Reportes: tablas faltantes para cobertura', { has });
  }
  if (has.informes_avance) {
    promises.push(
      sequelize.query(tiempoRevisionSql, { type: QueryTypes.SELECT, replacements: { yearStart, yearEnd }, searchPath })
    );
  } else {
    promises.push(Promise.resolve([{ promedio_dias: 0 }]));
    console.warn('Reportes: tabla faltante informes_avance');
  }
  if (has.evaluaciones_finales && has.practicas) {
    promises.push(
      sequelize.query(tiempoValidacionSql, { type: QueryTypes.SELECT, replacements: { yearStart, yearEnd }, searchPath })
    );
  } else {
    promises.push(Promise.resolve([{ promedio_dias: 0 }]));
    console.warn('Reportes: tablas faltantes para validación final');
  }
  if (has.practicas && has.ofertas_practica && has.empresas) {
    promises.push(
      sequelize.query(participacionEmpresarialSql, { type: QueryTypes.SELECT, replacements: { yearStart, yearEnd }, searchPath })
    );
  } else {
    promises.push(Promise.resolve([{ empresas_participantes: 0, top_empresas: [] }]));
    console.warn('Reportes: tablas faltantes para participación empresarial');
  }

  const [cobertura, tiempoRevision, tiempoValidacion, participacion] = await Promise.all(promises);

  const cov = cobertura?.[0] || { total_estudiantes: 0, total_con_practica: 0, detalle: [] };
  const rev = tiempoRevision?.[0] || { promedio_dias: 0 };
  const val = tiempoValidacion?.[0] || { promedio_dias: 0 };
  const part = participacion?.[0] || { empresas_participantes: 0, top_empresas: [] };

  const porcentajeCobertura = (() => {
    const total = Number(cov.total_estudiantes) || 0;
    const conPra = Number(cov.total_con_practica) || 0;
    if (total === 0) return 0;
    return Number(((conPra / total) * 100).toFixed(2));
  })();

  return {
    kpiCobertura: {
      porcentaje: porcentajeCobertura,
      totalEstudiantes: Number(cov.total_estudiantes) || 0,
      conPractica: Number(cov.total_con_practica) || 0,
      detallePorEspecialidad: cov.detalle || []
    },
    kpiTiempoRevisionInformes: {
      promedioDias: Number(rev.promedio_dias) || 0
    },
    kpiTiempoValidacionFinal: {
      promedioDias: Number(val.promedio_dias) || 0
    },
    kpiParticipacionEmpresarial: {
      empresasParticipantes: Number(part.empresas_participantes) || 0,
      topEmpresasPorPracticas: part.top_empresas || []
    }
  };
}
