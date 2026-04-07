const express = require('express');
const router = express.Router();
const {
  getAcabados,
  getAcabadoById,
  createAcabado,
  updateAcabado,
  deleteAcabado,
} = require('../controllers/acabadoController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas para acabados
router.get('/', protect, authorize(['admin', 'gerente', 'asesor']), getAcabados);
router.get('/:id', protect, authorize(['admin', 'gerente', 'asesor']), getAcabadoById);
router.post('/', protect, authorize(['admin', 'gerente']), createAcabado);
router.put('/:id', protect, authorize(['admin', 'gerente']), updateAcabado);
router.delete('/:id', protect, authorize(['admin', 'gerente']), deleteAcabado);

module.exports = router;
