// 📁 UBICACIÓN: backend/src/controladores/ofertas/ctrl.js
// 🎯 Controlador para la gestión de ofertas de práctica (ES Modules)

import { pool } from '../../configuracion/baseDatos.js';

// 📋 Obtener todas las ofertas con información de empresa y especialidad
export const getOfertas = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id_oferta,
        o.codigo_oferta,
        o.titulo_oferta,
        o.descripcion,
        o.requisitos,
        o.duracion_horas,
        o.horario_trabajo,
        o.ubicacion,
        o.modalidad_trabajo,
        o.cupos_disponibles,
        o.fecha_inicio,
        o.fecha_limite_postulacion,
        o.salario_referencial,
        o.beneficios,
        o.estado_oferta,
        o.fecha_creacion,
        e.razon_social AS empresa_nombre,
        e.nombre_comercial AS empresa_comercial,
        esp.nombre_especialidad,
        esp.codigo_especialidad,
        (SELECT COUNT(*) FROM siggip.postulaciones p WHERE p.id_oferta = o.id_oferta) AS total_postulaciones
      FROM siggip.ofertas_practica o
      INNER JOIN siggip.empresas e ON o.id_empresa = e.id_empresa
      INNER JOIN siggip.especialidades esp ON o.id_especialidad = esp.id_especialidad
      ORDER BY o.fecha_creacion DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};

// 🔍 Obtener una oferta por ID CON TODOS LOS DATOS DE LA EMPRESA
export const getOfertaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        o.id_oferta,
        o.codigo_oferta,
        o.titulo_oferta,
        o.descripcion,
        o.requisitos,
        o.duracion_horas,
        o.horario_trabajo,
        o.ubicacion,
        o.modalidad_trabajo,
        o.cupos_disponibles,
        o.fecha_inicio,
        o.fecha_limite_postulacion,
        o.salario_referencial,
        o.beneficios,
        o.estado_oferta,
        o.fecha_creacion,
        -- Datos básicos de empresa
        e.razon_social AS empresa_nombre,
        e.nombre_comercial AS empresa_comercial,
        e.rut_empresa,
        e.giro_comercial,
        e.sector_economico,
        -- Ubicación de la empresa
        e.direccion AS direccion_empresa,
        e.comuna AS comuna_empresa,
        e.region AS region_empresa,
        -- Contacto de la empresa
        e.telefono AS telefono_empresa,
        e.email_contacto AS email_contacto_empresa,
        e.contacto_principal,
        e.cargo_contacto,
        -- Otros datos de empresa
        e.fecha_convenio,
        e.estado_empresa,
        -- Datos de especialidad
        esp.nombre_especialidad,
        esp.codigo_especialidad,
        -- Conteo de postulaciones
        (SELECT COUNT(*) FROM siggip.postulaciones p WHERE p.id_oferta = o.id_oferta) AS total_postulaciones
      FROM siggip.ofertas_practica o
      INNER JOIN siggip.empresas e ON o.id_empresa = e.id_empresa
      INNER JOIN siggip.especialidades esp ON o.id_especialidad = esp.id_especialidad
      WHERE o.id_oferta = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener oferta:', error);
    res.status(500).json({ error: 'Error al obtener oferta' });
  }
};

/**
 * ➕ Crear nueva oferta
 * 
 * Reglas de negocio:
 * - fecha_limite_postulacion < fecha_inicio
 * - Las fechas no pueden ser en el pasado
 * - Campos obligatorios: empresa, especialidad, título, descripción, 
 *   duracion_horas, fecha_inicio, fecha_limite_postulacion
 */
export const createOferta = async (req, res) => {
  const {
    id_empresa,
    id_especialidad,
    titulo_oferta,
    descripcion,
    requisitos,
    duracion_horas,
    horario_trabajo,
    ubicacion,
    modalidad_trabajo,
    cupos_disponibles,
    fecha_inicio,
    fecha_limite_postulacion,
    salario_referencial,
    beneficios
  } = req.body;

  // Validaciones básicas
  if (!id_empresa || !id_especialidad || !titulo_oferta || !descripcion || !duracion_horas || !fecha_inicio || !fecha_limite_postulacion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar lógica de fechas
  const fechaLimite = new Date(fecha_limite_postulacion);
  const fechaInicio = new Date(fecha_inicio);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaLimite >= fechaInicio) {
    return res.status(400).json({ 
      error: 'La fecha límite de postulación debe ser anterior a la fecha de inicio de la práctica' 
    });
  }

  if (fechaLimite < hoy) {
    return res.status(400).json({ 
      error: 'La fecha límite de postulación no puede ser en el pasado' 
    });
  }

  if (fechaInicio < hoy) {
    return res.status(400).json({ 
      error: 'La fecha de inicio no puede ser en el pasado' 
    });
  }

  try {
    // Generar código de oferta
    const codigoQuery = 'SELECT COUNT(*) as total FROM siggip.ofertas_practica';
    const codigoResult = await pool.query(codigoQuery);
    const codigo_oferta = `OF-${String(parseInt(codigoResult.rows[0].total) + 1).padStart(4, '0')}`;

    const query = `
      INSERT INTO siggip.ofertas_practica (
        id_empresa, id_especialidad, codigo_oferta, titulo_oferta, descripcion,
        requisitos, duracion_horas, horario_trabajo, ubicacion, modalidad_trabajo,
        cupos_disponibles, fecha_inicio, fecha_limite_postulacion, salario_referencial,
        beneficios, estado_oferta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'activa')
      RETURNING *
    `;

    const values = [
      id_empresa,
      id_especialidad,
      codigo_oferta,
      titulo_oferta,
      descripcion,
      requisitos || null,
      duracion_horas,
      horario_trabajo || null,
      ubicacion || null,
      modalidad_trabajo || 'presencial',
      cupos_disponibles || 1,
      fecha_inicio,
      fecha_limite_postulacion,
      salario_referencial || null,
      beneficios || null
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      message: 'Oferta creada exitosamente',
      oferta: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear oferta:', error);
    
    // Manejar errores específicos de PostgreSQL
    if (error.code === '23514') {
      return res.status(400).json({ 
        error: 'Las fechas ingresadas no son válidas. La fecha límite debe ser anterior a la fecha de inicio.' 
      });
    }
    
    res.status(500).json({ error: 'Error al crear oferta' });
  }
};

/**
 * ✏️ Actualizar oferta
 */
export const updateOferta = async (req, res) => {
  const { id } = req.params;
  const {
    id_empresa,
    id_especialidad,
    titulo_oferta,
    descripcion,
    requisitos,
    duracion_horas,
    horario_trabajo,
    ubicacion,
    modalidad_trabajo,
    cupos_disponibles,
    fecha_inicio,
    fecha_limite_postulacion,
    salario_referencial,
    beneficios,
    estado_oferta
  } = req.body;

  // Validar lógica de fechas si se proporcionan
  if (fecha_inicio && fecha_limite_postulacion) {
    const fechaLimite = new Date(fecha_limite_postulacion);
    const fechaInicio = new Date(fecha_inicio);

    if (fechaLimite >= fechaInicio) {
      return res.status(400).json({ 
        error: 'La fecha límite de postulación debe ser anterior a la fecha de inicio de la práctica' 
      });
    }
  }

  try {
    const query = `
      UPDATE siggip.ofertas_practica
      SET 
        id_empresa = $1,
        id_especialidad = $2,
        titulo_oferta = $3,
        descripcion = $4,
        requisitos = $5,
        duracion_horas = $6,
        horario_trabajo = $7,
        ubicacion = $8,
        modalidad_trabajo = $9,
        cupos_disponibles = $10,
        fecha_inicio = $11,
        fecha_limite_postulacion = $12,
        salario_referencial = $13,
        beneficios = $14,
        estado_oferta = $15
      WHERE id_oferta = $16
      RETURNING *
    `;

    const values = [
      id_empresa,
      id_especialidad,
      titulo_oferta,
      descripcion,
      requisitos || null,
      duracion_horas,
      horario_trabajo || null,
      ubicacion || null,
      modalidad_trabajo,
      cupos_disponibles,
      fecha_inicio,
      fecha_limite_postulacion,
      // Convertir salario_referencial: si es string vacío o null, usar null, sino el valor
      salario_referencial === '' || salario_referencial === null || salario_referencial === undefined ? null : salario_referencial,
      beneficios || null,
      estado_oferta || 'activa',
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json({
      message: 'Oferta actualizada exitosamente',
      oferta: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar oferta:', error);
    
    if (error.code === '23514') {
      return res.status(400).json({ 
        error: 'Las fechas ingresadas no son válidas. La fecha límite debe ser anterior a la fecha de inicio.' 
      });
    }
    
    res.status(500).json({ error: 'Error al actualizar oferta' });
  }
};

// 🗑️ Eliminar oferta (soft delete - cambiar estado)
export const deleteOferta = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si tiene postulaciones
    const checkQuery = 'SELECT COUNT(*) as total FROM siggip.postulaciones WHERE id_oferta = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (parseInt(checkResult.rows[0].total) > 0) {
      // Si tiene postulaciones, solo cambiar estado
      const query = `
        UPDATE siggip.ofertas_practica
        SET estado_oferta = 'cerrada'
        WHERE id_oferta = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Oferta no encontrada' });
      }

      return res.json({
        message: 'Oferta cerrada (tiene postulaciones asociadas)',
        oferta: result.rows[0]
      });
    }

    // Si no tiene postulaciones, eliminar completamente
    const query = 'DELETE FROM siggip.ofertas_practica WHERE id_oferta = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    res.json({ message: 'Oferta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    res.status(500).json({ error: 'Error al eliminar oferta' });
  }
};

// 📊 Obtener estadísticas de ofertas
export const getEstadisticas = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_ofertas,
        COUNT(*) FILTER (WHERE estado_oferta = 'activa') as ofertas_activas,
        COUNT(*) FILTER (WHERE estado_oferta = 'cerrada') as ofertas_cerradas,
        COUNT(*) FILTER (WHERE estado_oferta = 'pausada') as ofertas_pausadas,
        AVG(cupos_disponibles) as promedio_cupos,
        SUM(cupos_disponibles) as total_cupos
      FROM siggip.ofertas_practica
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// 🏢 Obtener ofertas por empresa
export const getOfertasByEmpresa = async (req, res) => {
  const { idEmpresa } = req.params;

  try {
    const query = `
      SELECT 
        o.*,
        esp.nombre_especialidad,
        (SELECT COUNT(*) FROM siggip.postulaciones p WHERE p.id_oferta = o.id_oferta) AS total_postulaciones
      FROM siggip.ofertas_practica o
      INNER JOIN siggip.especialidades esp ON o.id_especialidad = esp.id_especialidad
      WHERE o.id_empresa = $1
      ORDER BY o.fecha_creacion DESC
    `;
    
    const result = await pool.query(query, [idEmpresa]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ofertas por empresa:', error);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};