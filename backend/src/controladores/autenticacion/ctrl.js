import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../../modelos/Usuario.js";

export const login = async (req, res) => {
  try {
    const email = (req.body?.email ?? "").toString().trim().toLowerCase();
    const password = (req.body?.password ?? "").toString();

    if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id_usuario, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "2h" }
    );

    const safeUser = {
      id: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      tipo_usuario: user.tipo_usuario, // ESTE ES EL CAMBIO IMPORTANTE
    };

    return res.json({ token, usuario: safeUser }); // Cambié "user" por "usuario"
  } catch (e) {
    console.error("❌ Error login:", e);
    return res.status(500).json({ error: "Error interno de autenticación" });
  }
};