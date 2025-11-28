// 📁 UBICACIÓN: backend/src/rutas/v1/profesores.js
// 🎯 Rutas completas para profesores

import { Router } from 'express';
import * as profesoresCtrl from '../../controladores/profesores/ctrl.js';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';

const router = Router();

// ==================== RUTAS PROTEGIDAS ====================
router.get('/perfil', verificarToken, profesoresCtrl.obtenerPerfilProfesor);
router.get('/estadisticas-profesor', verificarToken, profesoresCtrl.obtenerEstadisticasProfesor);
router.get('/mis-estudiantes', verificarToken, profesoresCtrl.obtenerMisEstudiantes);
router.get('/estudiante/:id_practica/bitacora', verificarToken, profesoresCtrl.obtenerBitacoraEstudiante);
router.get('/estudiante/:id_practica/informes', verificarToken, profesoresCtrl.obtenerInformesEstudiante);
router.get('/evaluacion/:id_practica', verificarToken, profesoresCtrl.obtenerEvaluacionCompleta);
router.post('/evaluacion/:id_practica/certificar', verificarToken, profesoresCtrl.certificarEvaluacion);

// ==================== RUTAS PÚBLICAS/ADMIN ====================
router.get('/estadisticas', profesoresCtrl.getEstadisticas);
router.get('/', profesoresCtrl.getAll);
router.get('/:id', profesoresCtrl.getOne);
router.put('/:id', profesoresCtrl.update);

export default router;