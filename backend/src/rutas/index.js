﻿import { Router } from 'express';
import salud from './v1/salud.js';
import auth from './v1/autenticacion.js';
import usuarios from './v1/usuarios.js';
import empresas from './v1/empresas.js'; 
import especialidades from './v1/especialidades.js';
import ofertas from './v1/ofertas.js';
import estudiantesRoutes from './v1/estudiantes.js';
import profesores from './v1/profesores.js';
import reportes from './v1/reportes.js';
const r = Router();

r.use('/salud', salud);
r.use('/auth', auth);
r.use('/usuarios', usuarios);
r.use('/empresas', empresas); 
r.use('/especialidades', especialidades);
r.use('/ofertas', ofertas);
r.use('/estudiantes', estudiantesRoutes);
r.use('/profesores', profesores);
r.use('/reportes', reportes);

export default r;