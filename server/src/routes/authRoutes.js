const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

const registerValidations = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').isEmail().withMessage('Por favor, ingrese un email válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('rol').isIn(['admin', 'gerente', 'asesor', 'cliente']).withMessage('Rol de usuario inválido.')
];

const loginValidations = [
  body('email').isEmail().withMessage('Por favor, ingrese un email válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.')
];

router.post('/register', registerValidations, registerUser);
router.post('/login', loginValidations, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
