// 📁 backend/src/modelos/UsuarioEmpresa.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

const UsuarioEmpresa = sequelize.define('UsuarioEmpresa', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  rol_empresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'usuarios_empresa',
  schema: 'siggip',        // quita si estás en public
  timestamps: false,
});

export default UsuarioEmpresa;
