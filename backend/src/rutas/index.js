import { Router } from 'express';
import salud from './v1/salud.js';
import auth from './v1/autenticacion.js';
import usuarios from './v1/usuarios.js';
import empresas from './v1/empresas.js'; 
import especialidades from './v1/especialidades.js';
import ofertas from './v1/ofertas.js';
const r = Router();

r.use('/salud', salud);
r.use('/auth', auth);
r.use('/usuarios', usuarios);
r.use('/empresas', empresas); 
r.use('/especialidades', especialidades);
r.use('/ofertas', ofertas);

export default r;