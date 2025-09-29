// 📁 UBICACIÓN: backend/src/modelos/Empresa.js
// Modelo para gestionar empresas

import { DataTypes } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

const Empresa = sequelize.define(
  'Empresa',
  {
    id_empresa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    nombre_comercial: {
      type: DataTypes.STRING(200),
    },
    rut_empresa: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
    },
    giro_comercial: {
      type: DataTypes.STRING(100),
    },
    sector_economico: {
      type: DataTypes.STRING(100),
    },
    direccion: {
      type: DataTypes.STRING(200),
    },
    comuna: {
      type: DataTypes.STRING(100),
    },
    region: {
      type: DataTypes.STRING(100),
    },
    telefono: {
      type: DataTypes.STRING(15),
    },
    email_contacto: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true,
      },
    },
    contacto_principal: {
      type: DataTypes.STRING(100),
    },
    cargo_contacto: {
      type: DataTypes.STRING(100),
    },
    fecha_convenio: {
      type: DataTypes.DATEONLY,
    },
    estado_empresa: {
      type: DataTypes.ENUM('activa', 'inactiva', 'suspendida'),
      defaultValue: 'activa',
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'empresas',
    schema: 'siggip',
    timestamps: false,
  }
);

export default Empresa;
