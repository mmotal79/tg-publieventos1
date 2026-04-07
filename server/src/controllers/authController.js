const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Para manejar errores de validación

// Función para generar un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Expira en 1 día
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public (inicialmente, luego solo admin/gerente)
const registerUser = async (req, res) => {
  // Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, password, rol } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe con este email.' });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      rol, // El rol puede ser enviado en el body, pero solo el admin/gerente deberían poder asignar roles distintos de 'cliente'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario.', error: error.message });
  }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  // Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
  }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  // req.user viene del middleware 'protect'
  res.json({
    _id: req.user._id,
    nombre: req.user.nombre,
    email: req.user.email,
    rol: req.user.rol,
  });
};


module.exports = { registerUser, loginUser, getMe };
