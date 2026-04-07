const express = require('express');
const {
  getPresupuestos,
  getPresupuestoById,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  generatePresupuestoPdf
} = require('../controllers/presupuestoController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

const presupuestoValidations = [
  body('cliente')
    .exists().withMessage('El cliente es requerido')
    .isMongoId().withMessage('ID de cliente inválido'),

  body('items')
    .exists().withMessage('Los items son requeridos')
    .bail()
    .isArray({ min: 1 }).withMessage('Debe haber al menos un ítem')
    .bail()
    .custom(items => {
      if (!Array.isArray(items)) throw new Error('Items debe ser un array');
      return items.every((item, index) => {
        if (!item) throw new Error(`Ítem ${index + 1}: No puede estar vacío`);
        if (!item.disenoModelo) throw new Error(`Ítem ${index + 1}: Diseño/modelo es requerido`);
        if (!item.cantidad || item.cantidad < 1) throw new Error(`Ítem ${index + 1}: Cantidad inválida`);
        if (!item.talla) throw new Error(`Ítem ${index + 1}: Talla es requerida`);
        if (!item.tela) throw new Error(`Ítem ${index + 1}: Tela es requerida`);
        if (!item.tipoCorte) throw new Error(`Ítem ${index + 1}: Tipo de corte es requerido`);
        return true;
      });
    }),

  body('items.*.disenoModelo')
    .isMongoId().withMessage('ID de diseño/modelo inválido'),

  body('items.*.tela')
    .isMongoId().withMessage('ID de tela inválido'),

  body('items.*.tipoCorte')
    .isMongoId().withMessage('ID de tipo de corte inválido'),

  body('items.*.personalizaciones.*')
    .optional()
    .isMongoId().withMessage('ID de personalización inválido'),

  body('items.*.acabadosEspeciales.*')
    .optional()
    .isMongoId().withMessage('ID de acabado especial inválido'),

  body('opcionesAdicionales.tipoEmpaque')
    .optional()
    .isIn(['Ninguno', 'Bolsa Plástica', 'Bolsa con Logo', 'Caja Individual'])
    .withMessage('Tipo de empaque inválido')
];

router.route('/')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getPresupuestos)
  .post(protect, authorize(['admin', 'gerente', 'asesor']), presupuestoValidations, createPresupuesto);

router.route('/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getPresupuestoById)
  .put(protect, authorize(['admin', 'gerente']), updatePresupuesto)
  .delete(protect, authorize(['admin']), deletePresupuesto);

router.route('/:id/pdf')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), generatePresupuestoPdf);

module.exports = router;
