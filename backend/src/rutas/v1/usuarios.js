// 📁 UBICACIÓN: backend/src/rutas/v1/usuarios.js
// Rutas para el CRUD de usuarios

import { Router } from 'express';
import * as usuariosCtrl from '../../controladores/usuarios/ctrl.js';

const router = Router();

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', usuariosCtrl.getAll);

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', usuariosCtrl.getOne);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', usuariosCtrl.create);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuariosCtrl.update);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuariosCtrl.deleteUser);

export default router;