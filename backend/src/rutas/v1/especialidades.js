// 📁 backend/src/rutas/v1/especialidades.js
import { Router } from 'express';
import { getAll, create, update, deleteEspecialidad } from '../../controladores/especialidades/ctrl.js';

const router = Router();
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteEspecialidad);

export default router;
