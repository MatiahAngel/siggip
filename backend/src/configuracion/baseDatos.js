import { Sequelize } from 'sequelize';
import { cfg } from './entorno.js';
import pkg from 'pg';
const { Pool } = pkg;

// Sequelize (si lo estás usando para modelos)
export const sequelize = new Sequelize(
  cfg.db.name,
  cfg.db.user,
  cfg.db.pass,
  { 
    host: cfg.db.host, 
    port: cfg.db.port, 
    dialect: 'postgres', 
    logging: false 
  }
);

// Pool de PostgreSQL para queries directas
export const pool = new Pool({
  host: cfg.db.host,
  user: cfg.db.user,
  password: cfg.db.pass,
  port: cfg.db.port,
  database: cfg.db.name,  // Cambia 'postgres' por cfg.db.name
  logging: false
});

// Función de conexión
export async function dbConnect() {
  try {
    await sequelize.authenticate();
    console.log('🟢 Conexión a PostgreSQL OK');
  } catch (err) {
    console.error('🔴 Error de conexión BD:', err.message);
  }
}