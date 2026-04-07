const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corregido el doble require

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Valor de JWT_SECRET:', process.env.JWT_SECRET); 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      
      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

const authorize = (rolesPermitidos) => { // Recibe UN ARRAY de roles
  return (req, res, next) => {
    // Verificar si el usuario está autenticado y tiene un rol
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ message: 'Acceso denegado. No se pudo determinar el rol del usuario.' });
    }

    const userRole = req.user.rol.toLowerCase(); // Rol del usuario logueado en minúsculas

    // Asegurarse de que rolesPermitidos es un array y convertir sus elementos a minúsculas
    const allowedRolesLowerCase = Array.isArray(rolesPermitidos)
      ? rolesPermitidos.map(role => role.toLowerCase())
      : [rolesPermitidos].map(role => role.toLowerCase()); // Si se pasa un solo string, lo convierte en array

    // Verificar si el rol del usuario está incluido en los roles permitidos
    if (!allowedRolesLowerCase.includes(userRole)) {
      return res.status(403).json({ message: 'Acceso denegado. No tienes el rol requerido.' });
    }
    next(); // Si el rol es permitido, continuar con la siguiente función de middleware
  };
};

module.exports = { protect, authorize };
