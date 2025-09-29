// 📁 backend/src/controladores/especialidades/ctrl.js
import Especialidad from '../../modelos/Especialidad.js';
import { Op } from 'sequelize';

export const getAll = async (req, res) => {
  try {
    const { estado, search } = req.query;
    const where = {};
    if (estado) where.estado = estado; // usa la col real

    if (search) {
      const q = `%${search}%`;
      where[Op.or] = [
        { nombre_especialidad: { [Op.iLike]: q } },
        { codigo_especialidad: { [Op.iLike]: q } },
        { sector_economico: { [Op.iLike]: q } },
        { descripcion: { [Op.iLike]: q } },
      ];
    }

    const data = await Especialidad.findAll({
      where,
      order: [['nombre_especialidad', 'ASC']],
    });
    res.json(data);
  } catch (e) {
    console.error('Error al obtener especialidades:', e);
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
};

export const create = async (req, res) => {
  try {
    const {
      codigo_especialidad,
      nombre_especialidad,
      descripcion,
      duracion_practica_min,
      duracion_practica_max,
      sector_economico,
      estado,
    } = req.body;

    if (!nombre_especialidad?.trim()) {
      return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
    }

    const nueva = await Especialidad.create({
      codigo_especialidad,
      nombre_especialidad,
      descripcion,
      duracion_practica_min,
      duracion_practica_max,
      sector_economico,
      estado: estado || 'activo',
      fecha_creacion: new Date(),
    });

    res.status(201).json(nueva);
  } catch (e) {
    console.error('Error al crear especialidad:', e);
    res.status(500).json({ error: 'Error al crear especialidad' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const esp = await Especialidad.findByPk(id);
    if (!esp) return res.status(404).json({ error: 'Especialidad no encontrada' });

    const {
      codigo_especialidad,
      nombre_especialidad,
      descripcion,
      duracion_practica_min,
      duracion_practica_max,
      sector_economico,
      estado,
    } = req.body;

    await esp.update({
      codigo_especialidad,
      nombre_especialidad,
      descripcion,
      duracion_practica_min,
      duracion_practica_max,
      sector_economico,
      estado,
    });

    res.json(esp);
  } catch (e) {
    console.error('Error al actualizar especialidad:', e);
    res.status(500).json({ error: 'Error al actualizar especialidad' });
  }
};

export const deleteEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    const esp = await Especialidad.findByPk(id);
    if (!esp) return res.status(404).json({ error: 'Especialidad no encontrada' });

    await esp.update({ estado: 'inactivo' }); // soft-delete
    res.json({ message: 'Especialidad inactivada correctamente' });
  } catch (e) {
    console.error('Error al eliminar especialidad:', e);
    res.status(500).json({ error: 'Error al eliminar especialidad' });
  }
};
