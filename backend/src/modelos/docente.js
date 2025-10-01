// 📁 backend/src/modelos/Docente.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

const Docente = sequelize.define(
  'Profesor',
  {
    id_profesor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_profesor',
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_usuario',
      references: {
        model: { tableName: 'usuarios', schema: 'siggip' },
        key: 'id_usuario',
      },
    },
    id_especialidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_especialidad',
      references: {
        model: { tableName: 'especialidades', schema: 'siggip' },
        key: 'id_especialidad',
      },
    },

    // Extras que existen en la tabla
    codigo_profesor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
      field: 'codigo_profesor',
    },
    cargo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Profesor',
      field: 'cargo',
    },

    anos_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'anos_experiencia',
    },
    titulo_profesional: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
      field: 'titulo_profesional',
    },

    // Tu código usa "estado_laboral"; en BD es "estado_profesor"
    estado_laboral: {
      field: 'estado_profesor',
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'activo',
      validate: { isIn: [['activo', 'inactivo', 'suspendido']] },
    },

    // Tu código usa "fecha_registro"; en BD es "fecha_actualizacion"
    fecha_registro: {
      field: 'fecha_actualizacion',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'profesores',
    schema: 'siggip',
    timestamps: false,
    underscored: true,
  }
);

export default Docente;
