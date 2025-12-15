import express from 'express';
import createError from 'http-errors';
import { verificarToken } from '../../controladores/autenticacion/ctrl.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { obtenerResumenReportes } from '../../servicios/reportesService.js';

const router = express.Router();

// GET /api/reportes/resumen?anio=YYYY
router.get(
  '/resumen',
  verificarToken,
  requireRole(['administrador']),
  async (req, res, next) => {
    try {
      const { anio } = req.query;
      const data = await obtenerResumenReportes(anio);
      return res.json(data);
    } catch (err) {
      console.error('Reportes resumen error:', err?.message);
      if (err?.stack) console.error(err.stack);
      return next(createError(500, 'Error al obtener reportes'));
    }
  }
);

export default router;
