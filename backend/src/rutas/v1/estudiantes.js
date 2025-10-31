// 📁 backend/src/rutas/v1/estudiantes.js
// 🎯 RUTAS COMPLETAS PARA ESTUDIANTES

import { Router } from 'express';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';
import {
  // Perfil y Estadísticas
  obtenerPerfilEstudiante,
  obtenerEstadisticasEstudiante,
  actualizarPerfil,
  
  // Postulaciones
  obtenerMisPostulaciones,
  postularAOferta,
  cancelarPostulacion,
  
  // Prácticas
  obtenerMisPracticas,
  obtenerOfertasDisponibles,
  
  // Informes
  obtenerMisInformes,
  subirInforme,
  uploadMiddleware,
  
  // Bitácora
  obtenerMiBitacora,
  registrarActividadBitacora,
  actualizarActividadBitacora,
  eliminarActividadBitacora,
  
  // Plan y Evaluaciones
  obtenerMiPlanPractica,
  obtenerMisEvaluaciones,
  
  // Notificaciones
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas
} from '../../controladores/estudiantes/ctrl.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ============================================
// PERFIL Y ESTADÍSTICAS
// ============================================

/**
 * @route   GET /api/v1/estudiantes/perfil
 * @desc    Obtener perfil completo del estudiante logueado
 * @access  Privado (estudiante)
 */
router.get('/perfil', obtenerPerfilEstudiante);

/**
 * @route   GET /api/v1/estudiantes/estadisticas
 * @desc    Obtener estadísticas del estudiante (prácticas, horas, postulaciones)
 * @access  Privado (estudiante)
 */
router.get('/estadisticas', obtenerEstadisticasEstudiante);

/**
 * @route   PUT /api/v1/estudiantes/perfil
 * @desc    Actualizar datos del perfil (teléfono, dirección)
 * @access  Privado (estudiante)
 */
router.put('/perfil', actualizarPerfil);

// ============================================
// POSTULACIONES
// ============================================

/**
 * @route   GET /api/v1/estudiantes/mis-postulaciones
 * @desc    Obtener todas las postulaciones del estudiante
 * @access  Privado (estudiante)
 */
router.get('/mis-postulaciones', obtenerMisPostulaciones);

/**
 * @route   POST /api/v1/estudiantes/ofertas/:id_oferta/postular
 * @desc    Postular a una oferta de práctica
 * @access  Privado (estudiante)
 */
router.post('/ofertas/:id_oferta/postular', postularAOferta);

/**
 * @route   PUT /api/v1/estudiantes/postulaciones/:id_postulacion/cancelar
 * @desc    Cancelar una postulación pendiente
 * @access  Privado (estudiante)
 */
router.put('/postulaciones/:id_postulacion/cancelar', cancelarPostulacion); 

// ============================================
// PRÁCTICAS Y OFERTAS
// ============================================

/**
 * @route   GET /api/v1/estudiantes/mis-practicas
 * @desc    Obtener todas las prácticas del estudiante
 * @access  Privado (estudiante)
 */
router.get('/mis-practicas', obtenerMisPracticas);

/**
 * @route   GET /api/v1/estudiantes/ofertas-disponibles
 * @desc    Obtener ofertas disponibles para la especialidad del estudiante
 * @access  Privado (estudiante)
 */
router.get('/ofertas-disponibles', obtenerOfertasDisponibles);

// ============================================
// INFORMES
// ============================================

/**
 * @route   GET /api/v1/estudiantes/mis-informes
 * @desc    Obtener todos los informes del estudiante
 * @access  Privado (estudiante)
 */
router.get('/mis-informes', obtenerMisInformes);

/**
 * @route   POST /api/v1/estudiantes/practicas/:id/informes
 * @desc    Subir un informe de práctica (máximo 3)
 * @access  Privado (estudiante)
 */
router.post('/practicas/:id/informes', uploadMiddleware, subirInforme);

// ============================================
// BITÁCORA DE ACTIVIDADES
// ============================================

/**
 * @route   GET /api/v1/estudiantes/practicas/:id_practica/bitacora
 * @desc    Obtener bitácora de actividades de una práctica
 * @access  Privado (estudiante)
 */
router.get('/practicas/:id_practica/bitacora', obtenerMiBitacora);

/**
 * @route   POST /api/v1/estudiantes/practicas/:id_practica/bitacora
 * @desc    Registrar una nueva actividad en la bitácora
 * @access  Privado (estudiante)
 */
router.post('/practicas/:id_practica/bitacora', registrarActividadBitacora);

/**
 * @route   PUT /api/v1/estudiantes/practicas/:id_practica/bitacora/:id_bitacora
 * @desc    Actualizar un registro de la bitácora
 * @access  Privado (estudiante)
 */
router.put('/practicas/:id_practica/bitacora/:id_bitacora', actualizarActividadBitacora);

/**
 * @route   DELETE /api/v1/estudiantes/practicas/:id_practica/bitacora/:id_bitacora
 * @desc    Eliminar un registro de la bitácora
 * @access  Privado (estudiante)
 */
router.delete('/practicas/:id_practica/bitacora/:id_bitacora', eliminarActividadBitacora);

// ============================================
// PLAN DE PRÁCTICA Y EVALUACIONES
// ============================================

/**
 * @route   GET /api/v1/estudiantes/mi-plan-practica
 * @desc    Obtener plan de práctica completo con áreas y tareas
 * @access  Privado (estudiante)
 */
router.get('/mi-plan-practica', obtenerMiPlanPractica);

/**
 * @route   GET /api/v1/estudiantes/mis-evaluaciones
 * @desc    Obtener todas las evaluaciones del estudiante
 * @access  Privado (estudiante)
 */
router.get('/mis-evaluaciones', obtenerMisEvaluaciones);

// ============================================
// NOTIFICACIONES
// ============================================

/**
 * @route   GET /api/v1/estudiantes/notificaciones
 * @desc    Obtener todas las notificaciones del estudiante
 * @access  Privado (estudiante)
 */
router.get('/notificaciones', obtenerNotificaciones);

/**
 * @route   PUT /api/v1/estudiantes/notificaciones/:id/leer
 * @desc    Marcar una notificación como leída
 * @access  Privado (estudiante)
 */
router.put('/notificaciones/:id/leer', marcarNotificacionLeida);

/**
 * @route   PUT /api/v1/estudiantes/notificaciones/leer-todas
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Privado (estudiante)
 */
router.put('/notificaciones/leer-todas', marcarTodasNotificacionesLeidas);

export default router;