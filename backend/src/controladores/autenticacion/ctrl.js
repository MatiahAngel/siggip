// 📁 UBICACIÓN: backend/src/controladores/autenticacion/ctrl.js
// 🎯 ADAPTACIÓN: Busca RUT con y sin guión en la BD + Middleware verificarToken

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../../modelos/Usuario.js";

export const login = async (req, res) => {
  try {
    const email = (req.body?.email ?? "").toString().trim().toLowerCase();
    const password = (req.body?.password ?? "").toString();

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // ============================================
    // NUEVO: Detectar si es email o RUT
    // ============================================
    const esEmail = email.includes('@');
    let user;

    if (esEmail) {
      // Búsqueda por email (profesores, empresas, admin, directivos)
      user = await Usuario.findOne({ where: { email } });
    } else {
      // ============================================
      // Búsqueda por RUT (estudiantes)
      // Busca con MÚLTIPLES FORMATOS
      // ============================================
      
      // Limpiar el RUT (quitar puntos y guiones)
      const rutLimpio = email.replace(/\./g, '').replace(/-/g, '').toLowerCase();
      
      console.log('🔍 RUT recibido:', email);
      console.log('🔍 RUT limpio:', rutLimpio);

      // INTENTO 1: Buscar RUT sin formato (ej: 20946974k)
      user = await Usuario.findOne({ 
        where: { rut: rutLimpio } 
      });

      // INTENTO 2: Si no encuentra, buscar con guión (ej: 20946974-k)
      if (!user && rutLimpio.length >= 2) {
        const rutConGuion = rutLimpio.slice(0, -1) + '-' + rutLimpio.slice(-1);
        console.log('🔍 Buscando con guión:', rutConGuion);
        
        user = await Usuario.findOne({ 
          where: { rut: rutConGuion } 
        });
      }

      // INTENTO 3: Si no encuentra, buscar en mayúscula sin guión (ej: 20946974K)
      if (!user) {
        const rutMayuscula = rutLimpio.toUpperCase();
        console.log('🔍 Buscando en mayúscula:', rutMayuscula);
        
        user = await Usuario.findOne({ 
          where: { rut: rutMayuscula } 
        });
      }

      // INTENTO 4: Si no encuentra, buscar con guión en mayúscula (ej: 20946974-K)
      if (!user && rutLimpio.length >= 2) {
        const rutConGuionMayuscula = rutLimpio.slice(0, -1) + '-' + rutLimpio.slice(-1).toUpperCase();
        console.log('🔍 Buscando con guión mayúscula:', rutConGuionMayuscula);
        
        user = await Usuario.findOne({ 
          where: { rut: rutConGuionMayuscula } 
        });
      }

      console.log('👤 Usuario encontrado:', user ? 'SÍ ✅' : 'NO ❌');
    }

    // ============================================
    // Validaciones
    // ============================================
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    // ============================================
    // Generar token
    // ============================================
    const token = jwt.sign(
      { id: user.id_usuario, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "2h" }
    );

    // ============================================
    // Preparar datos del usuario
    // ============================================
    const safeUser = {
      id_usuario: user.id_usuario,
      id: user.id_usuario,
      email: user.email,
      rut: user.rut,
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      telefono: user.telefono,
      tipo_usuario: user.tipo_usuario,
    };

    console.log('✅ Login exitoso para:', user.nombre, '- RUT:', user.rut);

    return res.json({ token, usuario: safeUser });

  } catch (e) {
    console.error("❌ Error login:", e);
    return res.status(500).json({ error: "Error interno de autenticación" });
  }
};

// ============================================
// MIDDLEWARE: Verificar Token JWT
// ============================================
export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    
    // Agregar datos del usuario al request
    req.usuario = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    return res.status(401).json({ error: 'Token inválido' });
  }
};