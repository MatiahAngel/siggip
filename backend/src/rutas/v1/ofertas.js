import { Router } from 'express';
import * as ofertasCtrl from '../../controladores/ofertas/ctrl.js';

const router = Router();

// 📋 Obtener todas las ofertas
router.get('/', ofertasCtrl.getOfertas);

// 📊 Obtener estadísticas de ofertas
router.get('/estadisticas', ofertasCtrl.getEstadisticas);

// 🏢 Obtener ofertas por empresa
router.get('/empresa/:idEmpresa', ofertasCtrl.getOfertasByEmpresa);

// 🔍 Obtener una oferta por ID
router.get('/:id', ofertasCtrl.getOfertaById);

// ➕ Crear nueva oferta
router.post('/', ofertasCtrl.createOferta);

// ✏️ Actualizar oferta
router.put('/:id', ofertasCtrl.updateOferta);

// 🗑️ Eliminar oferta
router.delete('/:id', ofertasCtrl.deleteOferta);

export default router;