// 📁 UBICACIÓN: backend/src/rutas/v1/estudiantes.js
// 🎯 PROPÓSITO: Rutas para estudiantes

import { Router } from 'express';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';
import {
  obtenerPerfilEstudiante,
  obtenerEstadisticasEstudiante,
  obtenerMisPostulaciones,
  obtenerMisPracticas,
  obtenerOfertasDisponibles
} from '../../controladores/estudiantes/ctrl.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ============================================
// RUTAS DE ESTUDIANTES
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
 * @route   GET /api/v1/estudiantes/mis-postulaciones
 * @desc    Obtener todas las postulaciones del estudiante
 * @access  Privado (estudiante)
 */
router.get('/mis-postulaciones', obtenerMisPostulaciones);

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

export default router;