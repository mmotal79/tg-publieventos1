const express = require('express');
const { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } = require('../controllers/clienteController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

const clienteValidations = [
  body('razonSocial').notEmpty().withMessage('La razón social es obligatoria.'),
  body('numeroIdentificacion').notEmpty().withMessage('El número de identificación es obligatorio.'),
  body('direccionFiscal').notEmpty().withMessage('La dirección fiscal es obligatoria.'),
  body('telefonoContacto').notEmpty().withMessage('El teléfono de contacto es obligatorio.').isMobilePhone('any').withMessage('Número de teléfono inválido.'),
  body('email').isEmail().withMessage('Email inválido.')
];

router.route('/')
  .get(protect, authorize('admin', 'gerente', 'asesor'), getClientes)
  .post(protect, authorize('admin', 'gerente', 'asesor'), clienteValidations, createCliente);

router.route('/:id')
  .get(protect, authorize('admin', 'gerente', 'asesor'), getClienteById)
  .put(protect, authorize('admin', 'gerente', 'asesor'), clienteValidations, updateCliente)
  .delete(protect, authorize('admin', 'gerente'), deleteCliente);

module.exports = router;
