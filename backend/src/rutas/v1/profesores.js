// 📁 backend/src/rutas/v1/profesores.js
// Rutas para la gestión de profesores

import { Router } from 'express';
import * as profesoresCtrl from '../../controladores/profesores/ctrl.js';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';

const router = Router();

// ==================== RUTAS DE PROFESORES ====================
// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros
router.get('/perfil', verificarToken, profesoresCtrl.obtenerPerfilProfesor);  // ← CON AUTH
router.get('/estadisticas', profesoresCtrl.getEstadisticas);
router.get('/', profesoresCtrl.getAll);
router.get('/:id', profesoresCtrl.getOne);
router.put('/:id', profesoresCtrl.update);

export default router;