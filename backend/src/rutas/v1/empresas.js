// =====================================================
// REEMPLAZAR TODO: backend/src/rutas/v1/empresas.js
// =====================================================
import { Router } from 'express';
import * as empresasCtrl from '../../controladores/empresas/ctrl.js';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';

const router = Router();

router.get('/estadisticas', empresasCtrl.getEstadisticas);
router.get('/mia', verificarToken, empresasCtrl.getMiEmpresa);
router.get('/', empresasCtrl.getAll);

router.get('/postulaciones', verificarToken, empresasCtrl.listarPostulacionesEmpresa);
router.get('/postulaciones/:id_postulacion/detalle', verificarToken, empresasCtrl.getDetallePostulante);
router.put('/postulaciones/:id_postulacion/aceptar', verificarToken, empresasCtrl.aceptarPostulacionEmpresa);
router.put('/postulaciones/:id_postulacion/rechazar', verificarToken, empresasCtrl.rechazarPostulacionEmpresa);

router.get('/practicantes', verificarToken, empresasCtrl.listarPracticantesEmpresa);
router.get('/practicantes/:id_practica/plan', verificarToken, empresasCtrl.getPlanPractica);
router.put('/practicantes/:id_practica/plan', verificarToken, empresasCtrl.actualizarPlanPractica);
router.get('/practicantes/:id_practica/bitacora', verificarToken, empresasCtrl.getBitacoraPracticante);
router.put('/bitacora/:id_actividad/validar', verificarToken, empresasCtrl.validarActividadBitacora);

// EVALUACIÓN FINAL - ORDEN CRÍTICO
router.get('/practicantes/:id_practica/estructura-evaluacion', verificarToken, empresasCtrl.getEstructuraEvaluacion);
router.get('/practicantes/:id_practica/evaluacion-final/existe', verificarToken, empresasCtrl.verificarEvaluacionFinal);
router.post('/practicantes/:id_practica/evaluacion-final/finalizar', verificarToken, empresasCtrl.finalizarEvaluacionFinal);
router.get('/practicantes/:id_practica/evaluacion-final', verificarToken, empresasCtrl.getEvaluacionFinal);
router.post('/practicantes/:id_practica/evaluacion-final', verificarToken, empresasCtrl.crearEvaluacionFinal);
router.put('/practicantes/:id_practica/evaluacion-final', verificarToken, empresasCtrl.actualizarEvaluacionFinal);

router.get('/practicantes/:id_practica/evaluaciones', verificarToken, empresasCtrl.getEvaluacionesPracticante);
router.post('/practicantes/:id_practica/evaluaciones', verificarToken, empresasCtrl.crearEvaluacion);
router.get('/evaluaciones/:id_evaluacion', verificarToken, empresasCtrl.getDetalleEvaluacion);
router.put('/evaluaciones/:id_evaluacion', verificarToken, empresasCtrl.actualizarEvaluacion);

router.get('/:id', empresasCtrl.getOne);
router.post('/', empresasCtrl.create);
router.put('/:id', empresasCtrl.update);
router.delete('/:id', empresasCtrl.deleteEmpresa);

export default router;