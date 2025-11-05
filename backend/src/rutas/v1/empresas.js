// 📁 UBICACIÓN: backend/src/rutas/v1/empresas.js
// Rutas para la gestión de empresas

import { Router } from 'express';
import * as empresasCtrl from '../../controladores/empresas/ctrl.js';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';

const router = Router();

// Rutas de empresas
router.get('/', empresasCtrl.getAll);
router.get('/estadisticas', empresasCtrl.getEstadisticas);
// Nueva: obtener la empresa asociada al usuario autenticado
router.get('/mia', verificarToken, empresasCtrl.getMiEmpresa);

// ==================== Postulaciones de Empresa ====================
// Nota: declarar rutas específicas ANTES de las rutas con parámetro ":id" para evitar colisiones
router.get('/postulaciones', verificarToken, empresasCtrl.listarPostulacionesEmpresa);
router.put('/postulaciones/:id_postulacion/aceptar', verificarToken, empresasCtrl.aceptarPostulacionEmpresa);
router.put('/postulaciones/:id_postulacion/rechazar', verificarToken, empresasCtrl.rechazarPostulacionEmpresa);
router.get('/practicantes', verificarToken, empresasCtrl.listarPracticantesEmpresa);

// Rutas con parámetro id (deben ir al final para no interceptar otras rutas)
router.get('/:id', empresasCtrl.getOne);
router.post('/', empresasCtrl.create);
router.put('/:id', empresasCtrl.update);
router.delete('/:id', empresasCtrl.deleteEmpresa);

export default router;