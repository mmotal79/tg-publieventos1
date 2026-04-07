const express = require('express');
const { body, check } = require('express-validator');

const {
  createTela, getTelas, getTelaById, updateTela, deleteTela,
  createDisenoModelo, getDisenosModelos, getDisenoModeloById, updateDisenoModelo, deleteDisenoModelo,
  createTipoCorte, getTiposCorte, getTipoCorteById, updateTipoCorte, deleteTipoCorte,
  createPersonalizacion, getPersonalizaciones, getPersonalizacionById, updatePersonalizacion, deletePersonalizacion,
  createAcabadoEspecial, getAcabadosEspeciales, getAcabadoEspecialById, updateAcabadoEspecial, deleteAcabadoEspecial,
  getConfigGlobal, updateConfigGlobal
} = require('../controllers/catalogoController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { createMaterial, getMateriales, getMaterialById, updateMaterial, deleteMaterial } = require('../controllers/materialController');
const { createAcabado, getAcabados, getAcabadoById, updateAcabado, deleteAcabado } = require('../controllers/acabadoController');

const materialValidation = [
    check('nombre', 'El nombre del material es obligatorio.').not().isEmpty(),
    check('costoPorMetro', 'El costo por metro es obligatorio y debe ser un número.').isFloat({ min: 0 }),
    check('unidadMedida', 'La unidad de medida es obligatoria.').not().isEmpty()
];
const acabadoValidation = [
    check('nombre', 'El nombre del acabado es obligatorio.').not().isEmpty(),
    check('costoUnitario', 'El costo unitario es obligatorio y debe ser un número.').isFloat({ min: 0 })
];

const router = express.Router();

// Rutas para Telas
router.route('/telas')
  .post(protect, authorize(['admin']),
    body('nombre', 'El nombre de la tela es obligatorio.').notEmpty(),
    body('gramaje', 'El gramaje es obligatorio y debe ser un número positivo.').isFloat({ min: 1 }),
    body('costoPorUnidad', 'El costo por unidad es obligatorio y debe ser un número.').isFloat({ min: 0 }),
    body('unidadMedida', 'La unidad de medida es obligatoria.').notEmpty(),
    body('anchoTelaMetros', 'El ancho de la tela en metros es obligatorio y debe ser un número positivo.').isFloat({ min: 0.01 }),
    createTela)
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getTelas);

router.route('/telas/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getTelaById)
  .put(protect, authorize(['admin', 'gerente']),
    body('nombre').optional().notEmpty().withMessage('El nombre de la tela no puede estar vacío.'),
    body('gramaje').optional().isFloat({ min: 1 }).withMessage('El gramaje debe ser un número positivo.'),
    body('costoPorUnidad').optional().isFloat({ min: 0 }).withMessage('El costo por unidad debe ser un número.'),
    body('unidadMedida').optional().notEmpty().withMessage('La unidad de medida no puede estar vacía.'),
    body('anchoTelaMetros').optional().isFloat({ min: 0.01 }).withMessage('El ancho de la tela en metros debe ser un número positivo.'),
    updateTela)
  .delete(protect, authorize(['admin', 'gerente']), deleteTela);

// Rutas para Diseño/Modelo
router.route('/disenos-modelos')
  .post(protect, authorize(['admin', 'gerente']),
    body('nombre', 'El nombre del diseño/modelo es obligatorio.').notEmpty(),
    body('tipoPrenda', 'El tipo de prenda es obligatorio.').notEmpty(),
    body('tiempoEstimadoConfeccionMin', 'El tiempo estimado de confección es obligatorio y debe ser un número positivo.').isFloat({ min: 0 }),
    body('factorCostoAdicional', 'El factor de costo adicional es obligatorio y debe ser un número positivo o cero.').isFloat({ min: 0 }),
    createDisenoModelo)
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getDisenosModelos);

router.route('/disenos-modelos/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getDisenoModeloById)
  .put(protect, authorize(['admin', 'gerente']),
    body('nombre').optional().notEmpty().withMessage('El nombre del diseño/modelo no puede estar vacío.'),
    body('tipoPrenda').optional().notEmpty().withMessage('El tipo de prenda no puede estar vacío.'),
    body('tiempoEstimadoConfeccionMin').optional().isFloat({ min: 0 }).withMessage('El tiempo estimado de confección debe ser un número positivo.'),
    body('factorCostoAdicional').optional().isFloat({ min: 0 }).withMessage('El factor de costo adicional debe ser un número positivo o cero.'),
    updateDisenoModelo)
  .delete(protect, authorize(['admin', 'gerente']), deleteDisenoModelo);

// Rutas para Tipo de Corte
router.route('/tipos-corte')
  .post(protect, authorize(['admin', 'gerente']),
    body('tipo', 'El tipo de corte es obligatorio.').notEmpty(),
    body('factorConsumoTela', 'El factor de consumo de tela es obligatorio y debe ser un número positivo.').isFloat({ min: 0 }),
    body('factorTiempoConfeccion', 'El factor de tiempo de confección es obligatorio y debe ser un número positivo.').isFloat({ min: 0 }),
    body('costoPorUnidad', 'El costo por unidad del tipo de corte es obligatorio y debe ser un número.').isFloat({ min: 0 }),
    createTipoCorte)
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getTiposCorte);

router.route('/tipos-corte/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getTipoCorteById)
  .put(protect, authorize(['admin', 'gerente']),
    body('tipo').optional().notEmpty().withMessage('El tipo de corte no puede estar vacío.'),
    body('factorConsumoTela').optional().isFloat({ min: 0 }).withMessage('El factor de consumo de tela debe ser un número positivo.'),
    body('factorTiempoConfeccion').optional().isFloat({ min: 0 }).withMessage('El factor de tiempo de confección debe ser un número positivo.'),
    body('costoPorUnidad').optional().isFloat({ min: 0 }).withMessage('El costo por unidad del tipo de corte debe ser un número.'),
    updateTipoCorte)
  .delete(protect, authorize(['admin', 'gerente']), deleteTipoCorte);

// Rutas para Personalización
router.route('/personalizaciones')
  .post(protect, authorize(['admin', 'gerente']), createPersonalizacion)
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getPersonalizaciones);

router.route('/personalizaciones/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getPersonalizacionById)
  .put(protect, authorize(['admin', 'gerente']), updatePersonalizacion)
  .delete(protect, authorize(['admin', 'gerente']), deletePersonalizacion);

// Rutas para Acabados Especiales
router.route('/acabados-especiales')
  .post(protect, authorize(['admin', 'gerente']),
    body('nombre', 'El nombre del acabado especial es obligatorio.').notEmpty(),
    body('costoPorUnidad', 'El costo por unidad debe ser un número.').isFloat({ min: 0 }),
    createAcabadoEspecial)
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getAcabadosEspeciales);

router.route('/acabados-especiales/:id')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getAcabadoEspecialById)
  .put(protect, authorize(['admin', 'gerente']),
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('costoPorUnidad').optional().isFloat({ min: 0 }).withMessage('El costo por unidad debe ser un número.'),
    updateAcabadoEspecial)
  .delete(protect, authorize(['admin']), deleteAcabadoEspecial);

// Rutas para Materiales
router.route('/materiales')
    .post(protect, authorize(['admin', 'gerente']), materialValidation, createMaterial)
    .get(protect, authorize(['admin', 'gerente', 'asesor']), getMateriales);

router.route('/materiales/:id')
    .get(protect, authorize(['admin', 'gerente', 'asesor']), getMaterialById)
    .put(protect, authorize(['admin', 'gerente']), materialValidation, updateMaterial)
    .delete(protect, authorize(['admin', 'gerente']), deleteMaterial);
	
// Rutas para Acabados
router.route('/acabados')
    .post(protect, authorize(['admin', 'gerente']), acabadoValidation, createAcabado)
    .get(protect, authorize(['admin', 'gerente', 'asesor']), getAcabados);

router.route('/acabados/:id')
    .get(protect, authorize(['admin', 'gerente', 'asesor']), getAcabadoById)
    .put(protect, authorize(['admin', 'gerente']), acabadoValidation, updateAcabado)
    .delete(protect, authorize(['admin', 'gerente']), deleteAcabado);

// Rutas para Configuración Global
router.route('/config-global')
  .get(protect, authorize(['admin', 'gerente', 'asesor']), getConfigGlobal);

router.route('/config-global/:id')
  .put(protect, authorize(['admin', 'gerente']), (req, res, next) => {
    console.log(`[Rutas] Ejecutando PUT para ConfigGlobal con ID: ${req.params.id}`);
    next();
  }, updateConfigGlobal);

module.exports = router;
