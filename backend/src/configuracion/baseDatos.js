import { Sequelize } from 'sequelize';
import { cfg } from './entorno.js';

export const sequelize = new Sequelize(
  cfg.db.name,
  cfg.db.user,
  cfg.db.pass,
  { host: cfg.db.host, port: cfg.db.port, dialect: 'postgres', logging: false }
);

export async function dbConnect() {
  try {
    await sequelize.authenticate();
    console.log('âœ… ConexiÃ³n a PostgreSQL OK');
  } catch (err) {
    console.error('âŒ Error de conexiÃ³n BD:', err.message);
  }
}
