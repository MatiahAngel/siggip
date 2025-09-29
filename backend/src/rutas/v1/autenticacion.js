import { Router } from 'express';
import { login } from '../../controladores/autenticacion/ctrl.js';
const r = Router();
r.post('/login', login);
export default r;
