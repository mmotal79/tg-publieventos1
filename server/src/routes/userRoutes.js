const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser, updateUserStatus, resetUserPassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

const updateUserValidations = [
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío.'),
  body('email').optional().isEmail().withMessage('El email debe ser válido.'),
  body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('rol').optional().isIn(['admin', 'gerente', 'asesor', 'cliente']).withMessage('Rol de usuario inválido.')
];

router.route('/')
  .get(protect, authorize(['admin', 'gerente']), getUsers);

router.route('/:id')
  .get(protect, authorize(['admin', 'gerente']), getUserById)
  .put(protect, authorize(['admin', 'gerente']), updateUserValidations, updateUser)
  .delete(protect, authorize(['admin']), deleteUser);

router.route('/:id/status')
  .patch(protect, authorize(['admin', 'gerente']), updateUserStatus);

router.route('/:id/reset-password')
  .patch(protect, authorize(['admin', 'gerente']), resetUserPassword);

module.exports = router;
