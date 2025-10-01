// 📁 UBICACIÓN: backend/src/modelos/Estudiante.js
// Modelo para gestionar estudiantes

import { DataTypes } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

const Estudiante = sequelize.define(
  'Estudiante',
  {
    id_estudiante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_especialidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo_estudiante: {
      type: DataTypes.STRING(20),
    },
    nivel_academico: {
      type: DataTypes.STRING(20),
    },
    promedio_notas: {
      type: DataTypes.DECIMAL(3, 2),
    },
    ano_ingreso: {
      type: DataTypes.INTEGER,
    },
    ano_egreso: {
      type: DataTypes.INTEGER,
    },
    estado_estudiante: {
      type: DataTypes.STRING,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'estudiantes',
    schema: 'siggip',
    timestamps: false,
  }
);

export default Estudiante;