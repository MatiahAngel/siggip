import { DataTypes } from "sequelize";
import { sequelize } from "../configuracion/baseDatos.js";

/**
 * Mapea la tabla siggip.usuarios EXACTAMENTE como está en PostgreSQL.
 * Nota: en PG algunas columnas son ENUMs (tipo_usuario, estado). Para evitar
 * problemas de tipos al leer/escribir desde Sequelize, las mapeamos como STRING.
 * (PG validará igualmente los valores permitidos).
 */
const Usuario = sequelize.define("usuarios", {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // credenciales
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // datos personales
  nombre: DataTypes.STRING(50),
  apellido_paterno: DataTypes.STRING(50),
  apellido_materno: DataTypes.STRING(50),
  rut: DataTypes.STRING(12),

  // contacto
  telefono: DataTypes.STRING(15),
  direccion: DataTypes.TEXT,

  // clasificaciones (en BD son ENUM → aquí STRING para no pelear con tipos)
  tipo_usuario: {
    type: DataTypes.STRING(30), // ej: 'administrador', 'docente', 'estudiante'
    defaultValue: "administrador",
  },
  estado: {
    type: DataTypes.STRING(20), // ej: 'activo', 'inactivo', 'suspendido'
    defaultValue: "activo",
  },

  // otros
  foto_perfil: DataTypes.STRING(255),

  // timestamps de BD (no uses timestamps automáticos de Sequelize)
  fecha_creacion: DataTypes.DATE,
}, {
  tableName: "usuarios",
  schema: "siggip",
  timestamps: false, // la columna fecha_creacion ya existe en BD
});

export default Usuario;
