const express = require('express');
const router = express.Router();
const {
  getMateriales,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize(['admin', 'gerente', 'asesor']), getMateriales);
router.get('/:id', protect, authorize(['admin', 'gerente', 'asesor']), getMaterialById);
router.post('/', protect, authorize(['admin', 'gerente']), createMaterial);
router.put('/:id', protect, authorize(['admin', 'gerente']), updateMaterial);
router.delete('/:id', protect, authorize(['admin', 'gerente']), deleteMaterial);

module.exports = router;
