const express = require('express');
const { getConfigGlobal, updateConfigGlobal } = require('../controllers/configGlobalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

const updateConfigValidations = [
  body('margenGanancia').optional().isFloat({ min: 0 }).withMessage('El margen de ganancia debe ser un número positivo.'),
  body('impuestoIVA').optional().isFloat({ min: 0 }).withMessage('El impuesto IVA debe ser un número positivo.'),
  body('costoDisenoGraficoBase').optional().isFloat({ min: 0 }).withMessage('El costo de diseño gráfico base debe ser un número positivo.'),
  body('costoMuestraFisicaBase').optional().isFloat({ min: 0 }).withMessage('El costo de muestra física base debe ser un número positivo.'),
];

router.route('/')
  .get(getConfigGlobal)
  .put(protect, authorize('admin'), updateConfigValidations, updateConfigGlobal);

module.exports = router;
