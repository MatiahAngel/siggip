import createError from 'http-errors';

// Middleware de autorización por rol
// Requiere que authMiddleware haya poblado req.user con { tipo_usuario, ... }
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const user = req.user || req.usuario;
      if (!user) return next(createError(401, 'No autenticado'));
      const rol = user.tipo_usuario;
      if (!allowedRoles.includes(rol)) {
        return next(createError(403, 'No autorizado'));
      }
      return next();
    } catch (err) {
      return next(createError(500, 'Error en autorización'));
    }
  };
}
