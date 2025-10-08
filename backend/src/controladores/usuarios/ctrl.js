// 📁 backend/src/controladores/usuarios/ctrl.js
import bcrypt from 'bcryptjs';
import Usuario from '../../modelos/Usuario.js';
import Estudiante from '../../modelos/estudiante.js';
import Docente from '../../modelos/docente.js';
import Especialidad from '../../modelos/Especialidad.js';

const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// Normaliza texto: a minúsculas y sin acentos/diacríticos
const normalizeText = (s) =>
  (s?.toString?.() || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Función auxiliar para generar código de profesor
const generarCodigoProfesor = async (idEspecialidad, idProfesor) => {
  let prefix = 'PROF_';
  try {
    if (idEspecialidad) {
      const esp = await Especialidad.findByPk(idEspecialidad);
      const nameNorm = normalizeText(esp?.nombre_especialidad || '');
      if (nameNorm.includes('agro')) prefix = 'PROFEAGRO';
      else if (nameNorm.includes('mecan')) prefix = 'PROFEMECA';
    }
  } catch (_) {
    // mantener prefix por defecto
  }
  return `${prefix}${String(idProfesor).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = estado === 'todos' ? {} : { estado: 'activo' };

    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['id_usuario', 'DESC']],
    });

    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.tipo_usuario === 'estudiante') {
      const estudiante = await Estudiante.findOne({ where: { id_usuario: id } });
      return res.json({ ...usuario.toJSON(), datosEstudiante: estudiante });
    }

    if (usuario.tipo_usuario === 'profesor') {
      const docente = await Docente.findOne({ where: { id_usuario: id } });
      return res.json({ ...usuario.toJSON(), datosDocente: docente });
    }

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const create = async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      rut,
      telefono,
      tipo_usuario,
      password,
      id_especialidad,
      ano_ingreso,
      titulo_profesional,
      anos_experiencia,
      codigo_profesor,
      cargo,
      estado_laboral,
      estado,
    } = req.body;

    if (!nombre || !apellido_paterno || !email || !rut || !tipo_usuario || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existeEmail = await Usuario.findOne({ where: { email: email.toLowerCase() } });
    if (existeEmail) return res.status(400).json({ error: 'El email ya está registrado' });

    const existeRut = await Usuario.findOne({ where: { rut } });
    if (existeRut) return res.status(400).json({ error: 'El RUT ya está registrado' });

    if (tipo_usuario === 'estudiante' && !id_especialidad) {
      return res.status(400).json({ error: 'La especialidad es obligatoria para estudiantes' });
    }
    if (tipo_usuario === 'profesor' && !id_especialidad) {
      return res.status(400).json({ error: 'La especialidad es obligatoria para profesores' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido_paterno,
      apellido_materno,
      email: email.toLowerCase(),
      rut,
      telefono,
      tipo_usuario,
      password_hash,
      estado: estado || 'activo',
    });

    if (tipo_usuario === 'estudiante') {
      await Estudiante.create({
        id_usuario: nuevoUsuario.id_usuario,
        id_especialidad,
        ano_ingreso: ano_ingreso || new Date().getFullYear(),
      });
    } else if (tipo_usuario === 'profesor') {
      const ultimoDocente = await Docente.findOne({
        order: [['id_profesor', 'DESC']],
        attributes: ['id_profesor'],
      });
      const proximoId = ultimoDocente ? ultimoDocente.id_profesor + 1 : 1;

      let codigoFinal;
      if (codigo_profesor && String(codigo_profesor).trim() !== '') {
        codigoFinal = String(codigo_profesor).trim();
      } else {
        codigoFinal = await generarCodigoProfesor(id_especialidad, proximoId);
      }

      await Docente.create({
        id_usuario: nuevoUsuario.id_usuario,
        id_especialidad,
        titulo_profesional: titulo_profesional || '',
        anos_experiencia: Number(anos_experiencia) || 0,
        codigo_profesor: codigoFinal,
        cargo: cargo || 'Profesor',
        estado_laboral: estado_laboral || 'activo',
      });
    }

    const usuarioResponse = nuevoUsuario.toJSON();
    delete usuarioResponse.password_hash;
    return res.status(201).json(usuarioResponse);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      rut,
      telefono,
      tipo_usuario,
      password,
      estado,
      id_especialidad,
      ano_ingreso,
      titulo_profesional,
      anos_experiencia,
      codigo_profesor,
      cargo,
      estado_laboral,
    } = req.body;

    if (email && email !== usuario.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      const existeEmail = await Usuario.findOne({ where: { email: email.toLowerCase() } });
      if (existeEmail && existeEmail.id_usuario !== Number(id)) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
    }
    if (rut && rut !== usuario.rut) {
      const existeRut = await Usuario.findOne({ where: { rut } });
      if (existeRut && existeRut.id_usuario !== Number(id)) {
        return res.status(400).json({ error: 'El RUT ya está en uso' });
      }
    }

    const usuarioPayload = compact({
      nombre,
      apellido_paterno,
      apellido_materno,
      email: email?.toLowerCase(),
      rut,
      telefono,
      tipo_usuario,
      estado,
    });

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      usuarioPayload.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(usuarioPayload).length) {
      await usuario.update(usuarioPayload);
    }

    const tipoActual = usuarioPayload.tipo_usuario || usuario.tipo_usuario;

    if (tipoActual === 'estudiante') {
      const estudiante = await Estudiante.findOne({ where: { id_usuario: id } });
      const estPayload = compact({
        id_especialidad,
        ano_ingreso,
      });

      if (estudiante) {
        if (Object.keys(estPayload).length) await estudiante.update(estPayload);
      } else if (Object.keys(estPayload).length) {
        await Estudiante.create({ id_usuario: usuario.id_usuario, ...estPayload });
      }
    }

    if (tipoActual === 'profesor') {
      const docente = await Docente.findOne({ where: { id_usuario: id } });

      if (docente) {
        const docPayload = compact({
          ...(id_especialidad !== undefined ? { id_especialidad } : {}),
          titulo_profesional: titulo_profesional?.trim(),
          anos_experiencia:
            anos_experiencia !== undefined && anos_experiencia !== null
              ? Number(anos_experiencia)
              : undefined,
          ...(codigo_profesor && String(codigo_profesor).trim() !== ''
            ? { codigo_profesor: String(codigo_profesor).trim() }
            : {}),
          cargo,
          estado_laboral,
        });

        if (Object.keys(docPayload).length) {
          await docente.update(docPayload);
        }

        await docente.reload();
        if (!docente.codigo_profesor || String(docente.codigo_profesor).trim() === '') {
          const nuevoCodigo = await generarCodigoProfesor(
            docente.id_especialidad,
            docente.id_profesor
          );
          await docente.update({ codigo_profesor: nuevoCodigo });
        }
      } else {
        const ultimoDocente = await Docente.findOne({
          order: [['id_profesor', 'DESC']],
          attributes: ['id_profesor'],
        });
        const proximoId = ultimoDocente ? ultimoDocente.id_profesor + 1 : 1;

        let codigoFinal;
        if (codigo_profesor && String(codigo_profesor).trim() !== '') {
          codigoFinal = String(codigo_profesor).trim();
        } else {
          codigoFinal = await generarCodigoProfesor(id_especialidad, proximoId);
        }

        await Docente.create({
          id_usuario: usuario.id_usuario,
          id_especialidad: id_especialidad || null,
          titulo_profesional: titulo_profesional?.trim() || '',
          anos_experiencia:
            anos_experiencia !== undefined && anos_experiencia !== null
              ? Number(anos_experiencia)
              : 0,
          codigo_profesor: codigoFinal,
          cargo: cargo || 'Profesor',
          estado_laboral: estado_laboral || 'activo',
        });
      }
    }

    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.password_hash;
    return res.json(usuarioResponse);
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.update({ estado: 'inactivo' });

    if (usuario.tipo_usuario === 'profesor') {
      await Docente.update(
        { estado_laboral: 'inactivo' },
        { where: { id_usuario: id } }
      );
    }

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};