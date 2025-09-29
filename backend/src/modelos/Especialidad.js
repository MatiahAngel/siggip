// 📁 backend/src/modelos/Especialidad.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

const Especialidad = sequelize.define('Especialidad', {
  id_especialidad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_especialidad: { type: DataTypes.STRING(10) },
  nombre_especialidad: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  duracion_practica_min: { type: DataTypes.INTEGER },
  duracion_practica_max: { type: DataTypes.INTEGER },
  sector_economico: { type: DataTypes.STRING(100) },
  estado: { type: DataTypes.STRING(20), defaultValue: 'activo' }, // tu enum existe en BD; usamos string para no chocar
  fecha_creacion: { type: DataTypes.DATE },
}, {
  tableName: 'especialidades',
  schema: 'siggip',      // ⚠️ si tu tabla está en "public", quita esta línea
  timestamps: false,
});

export default Especialidad;
