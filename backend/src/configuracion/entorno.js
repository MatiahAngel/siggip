import 'dotenv/config';
export const cfg = {
  port: process.env.API_PORT || 4000,
  jwt: process.env.JWT_SECRET || 'dev',
  db: {
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD
  }
};
