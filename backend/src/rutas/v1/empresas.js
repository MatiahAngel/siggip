// 📁 UBICACIÓN: backend/src/rutas/v1/empresas.js
// Rutas para la gestión de empresas

import { Router } from 'express';
import * as empresasCtrl from '../../controladores/empresas/ctrl.js';

const router = Router();

// Rutas de empresas
router.get('/', empresasCtrl.getAll);
router.get('/estadisticas', empresasCtrl.getEstadisticas);
router.get('/:id', empresasCtrl.getOne);
router.post('/', empresasCtrl.create);
router.put('/:id', empresasCtrl.update);
router.delete('/:id', empresasCtrl.deleteEmpresa);

export default router;