// 📁 UBICACIÓN: backend/src/rutas/v1/empresas.js
// Rutas para la gestión de empresas

import { Router } from 'express';
import * as empresasCtrl from '../../controladores/empresas/ctrl.js';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';

const router = Router();

// Rutas de empresas
router.get('/', empresasCtrl.getAll);
router.get('/estadisticas', empresasCtrl.getEstadisticas);
router.get('/mia', verificarToken, empresasCtrl.getMiEmpresa);

// ==================== Postulaciones de Empresa ====================
router.get('/postulaciones', verificarToken, empresasCtrl.listarPostulacionesEmpresa);
router.get('/postulaciones/:id_postulacion/detalle', verificarToken, empresasCtrl.getDetallePostulante); // ⬅️ NUEVA
router.put('/postulaciones/:id_postulacion/aceptar', verificarToken, empresasCtrl.aceptarPostulacionEmpresa);
router.put('/postulaciones/:id_postulacion/rechazar', verificarToken, empresasCtrl.rechazarPostulacionEmpresa);

// ==================== Practicantes de Empresa ====================
router.get('/practicantes', verificarToken, empresasCtrl.listarPracticantesEmpresa);
router.get('/practicantes/:id_practica/plan', verificarToken, empresasCtrl.getPlanPractica); // ⬅️ NUEVA
router.put('/practicantes/:id_practica/plan', verificarToken, empresasCtrl.actualizarPlanPractica); // ⬅️ NUEVA
router.get('/practicantes/:id_practica/bitacora', verificarToken, empresasCtrl.getBitacoraPracticante); // ⬅️ NUEVA
router.get('/practicantes/:id_practica/evaluaciones', verificarToken, empresasCtrl.getEvaluacionesPracticante); // ⬅️ NUEVA
router.post('/practicantes/:id_practica/evaluaciones', verificarToken, empresasCtrl.crearEvaluacion); // ⬅️ NUEVA

// ==================== Bitácora ====================
router.put('/bitacora/:id_actividad/validar', verificarToken, empresasCtrl.validarActividadBitacora); // ⬅️ NUEVA

// ==================== Evaluaciones ====================
router.get('/evaluaciones/:id_evaluacion', verificarToken, empresasCtrl.getDetalleEvaluacion); // ⬅️ NUEVA
router.put('/evaluaciones/:id_evaluacion', verificarToken, empresasCtrl.actualizarEvaluacion); // ⬅️ NUEVA

// Rutas con parámetro id (deben ir al final para no interceptar otras rutas)
router.get('/:id', empresasCtrl.getOne);
router.post('/', empresasCtrl.create);
router.put('/:id', empresasCtrl.update);
router.delete('/:id', empresasCtrl.deleteEmpresa);

export default router;