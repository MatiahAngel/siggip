# SIGGIP - Setup completo backend + frontend
# Ejecutar este script desde la carpeta SIGGIP en VS Code (Terminal PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando setup de SIGGIP..." -ForegroundColor Cyan

# --- 1. Backend ---
Write-Host ">> Creando backend..." -ForegroundColor Yellow
if (!(Test-Path "backend")) { mkdir backend | Out-Null }
cd backend

npm init -y | Out-Null
npm pkg set type=module | Out-Null
npm pkg set scripts.dev="nodemon src/servidor.js" | Out-Null
npm pkg set scripts.start="node src/servidor.js" | Out-Null

npm i express cors dotenv jsonwebtoken bcryptjs sequelize pg
npm i -D nodemon

# .env backend
@"
API_PORT=4000
JWT_SECRET=super_seguro
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigipp
DB_USER=postgres
DB_PASSWORD=postgres
"@ | Out-File -Encoding utf8 .env

# Estructura backend
mkdir src, src\configuracion, src\modelos, src\rutas, src\rutas\v1, src\controladores, src\controladores\autenticacion -Force | Out-Null

@"
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
"@ | Out-File -Encoding utf8 src\configuracion\entorno.js

@"
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
    console.log('✅ Conexión a PostgreSQL OK');
  } catch (err) {
    console.error('❌ Error de conexión BD:', err.message);
  }
}
"@ | Out-File -Encoding utf8 src\configuracion\baseDatos.js

@"
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracion/baseDatos.js';

class Usuario extends Model {}

Usuario.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password_hash: { type: DataTypes.STRING },
  rol: { type: DataTypes.STRING }
}, { sequelize, tableName: 'usuarios', timestamps: false });

export default Usuario;
"@ | Out-File -Encoding utf8 src\modelos\Usuario.js

@"
import { sequelize } from '../configuracion/baseDatos.js';
import Usuario from './Usuario.js';
export { sequelize, Usuario };
"@ | Out-File -Encoding utf8 src\modelos\index.js

@"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cfg } from '../../configuracion/entorno.js';
import { Usuario } from '../../modelos/index.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const u = await Usuario.findOne({ where: { email } });
  if (!u) return res.status(401).json({ error: 'Usuario no encontrado' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });
  const token = jwt.sign({ sub: u.id, rol: u.rol }, cfg.jwt, { expiresIn: '8h' });
  res.json({ token, user: { id: u.id, nombre: u.nombre, rol: u.rol } });
}
"@ | Out-File -Encoding utf8 src\controladores\autenticacion\ctrl.js

@"
import { Router } from 'express';
import { login } from '../../controladores/autenticacion/ctrl.js';
const r = Router();
r.post('/login', login);
export default r;
"@ | Out-File -Encoding utf8 src\rutas\v1\autenticacion.js

@"
import { Router } from 'express';
const r = Router();
r.get('/', (_, res) => res.json({ status: 'ok' }));
export default r;
"@ | Out-File -Encoding utf8 src\rutas\v1\salud.js

@"
import { Router } from 'express';
import salud from './v1/salud.js';
import auth from './v1/autenticacion.js';
const r = Router();
r.use('/salud', salud);
r.use('/auth', auth);
export default r;
"@ | Out-File -Encoding utf8 src\rutas\index.js

@"
import express from 'express';
import cors from 'cors';
import routes from './rutas/index.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
export default app;
"@ | Out-File -Encoding utf8 src\app.js

@"
import app from './app.js';
import { cfg } from './configuracion/entorno.js';
import { dbConnect } from './configuracion/baseDatos.js';
(async () => {
  await dbConnect();
  app.listen(cfg.port, () => console.log(`🚀 API http://localhost:${cfg.port}`));
})();
"@ | Out-File -Encoding utf8 src\servidor.js

cd ..

# --- 2. Frontend ---
Write-Host ">> Creando frontend..." -ForegroundColor Yellow
if (!(Test-Path "frontend")) { mkdir frontend | Out-Null }
cd frontend

npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Config Tailwind
(Get-Content tailwind.config.js) -replace 'content: \[\]', 'content: ["./index.html","./src/**/*.{js,jsx}"]' | Set-Content tailwind.config.js

if (!(Test-Path "src\estilos")) { mkdir src\estilos | Out-Null }
"@tailwind base;`n@tailwind components;`n@tailwind utilities;" | Out-File -Encoding utf8 src\estilos\tailwind.css

if (!(Test-Path "src\servicios\api")) { mkdir src\servicios\api -Force | Out-Null }
@"
import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
"@ | Out-File -Encoding utf8 src\servicios\api\cliente.js

if (!(Test-Path "src\paginas\autenticacion")) { mkdir src\paginas\autenticacion -Force | Out-Null }
@"
import { useState } from 'react';
import { api } from '../../servicios/api/cliente';

export default function IniciarSesion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setMsg('Inicio de sesión exitoso');
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error de autenticación');
    }
  };

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ingresar</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border p-2">Entrar</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
"@ | Out-File -Encoding utf8 src\paginas\autenticacion\IniciarSesion.jsx

@"
import './estilos/tailwind.css';
import IniciarSesion from './paginas/autenticacion/IniciarSesion';
export default function App() { return <IniciarSesion /> }
"@ | Out-File -Encoding utf8 src\App.jsx

cd ..

Write-Host "`n✅ Setup terminado. Estructura creada dentro de SIGGIP." -ForegroundColor Green
Write-Host "   - Backend: SIGGIP/backend (API en http://localhost:4000/api/salud)" -ForegroundColor Green
Write-Host "   - Frontend: SIGGIP/frontend (Web en http://localhost:5173)" -ForegroundColor Green
Write-Host "`n👉 Siguientes pasos:"
Write-Host "1) Inserta un usuario en tu BD 'usuarios' (con bcrypt hash de la contraseña)."
Write-Host "   Ejemplo: node -e \"console.log(require('bcryptjs').hashSync('123456', 10))\""
Write-Host "2) Ejecuta backend:   cd backend && npm run dev"
Write-Host "3) Ejecuta frontend:  cd frontend && npm run dev"
