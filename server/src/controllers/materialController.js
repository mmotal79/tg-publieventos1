const Material = require('../models/Material');
const { validationResult } = require('express-validator');

// @desc    Obtener todos los materiales
// @route   GET /api/catalogos/materiales
// @access  Private (Asesor, Gerente, Admin)
const getMateriales = async (req, res) => {
    try {
        const materiales = await Material.find({});
        res.json(materiales);
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        res.status(500).json({ message: 'Error al obtener materiales.', error: error.message });
    }
};

// @desc    Obtener un material por ID
// @route   GET /api/catalogos/materiales/:id
// @access  Private (Asesor, Gerente, Admin)
const getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (material) {
            res.json(material);
        } else {
            res.status(404).json({ message: 'Material no encontrado.' });
        }
    } catch (error) {
        console.error(`Error al obtener material con ID ${req.params.id}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de material inválido.' });
        }
        res.status(500).json({ message: 'Error al obtener material.', error: error.message });
    }
};

// @desc    Crear un nuevo material
// @route   POST /api/catalogos/materiales
// @access  Private (Admin, Gerente)
const createMaterial = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion, costoPorMetro, unidadMedida } = req.body;

    try {
        const materialExists = await Material.findOne({ nombre });
        if (materialExists) {
            return res.status(400).json({ message: 'Ya existe un material con este nombre.' });
        }

        const material = await Material.create({
            nombre,
            descripcion,
            costoPorMetro,
            unidadMedida
        });

        res.status(201).json(material);
    } catch (error) {
        console.error('Error al crear material:', error);
        res.status(500).json({ message: 'Error al crear material.', error: error.message });
    }
};

// @desc    Actualizar un material
// @route   PUT /api/catalogos/materiales/:id
// @access  Private (Admin, Gerente)
const updateMaterial = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const material = await Material.findById(req.params.id);

        if (material) {
            // Check if a material with the new name already exists (excluding the current material)
            if (req.body.nombre && req.body.nombre !== material.nombre) {
                const existingMaterial = await Material.findOne({ nombre: req.body.nombre });
                if (existingMaterial && existingMaterial._id.toString() !== material._id.toString()) {
                    return res.status(400).json({ message: 'Ya existe otro material con este nombre.' });
                }
            }

            material.nombre = req.body.nombre || material.nombre;
            material.descripcion = req.body.descripcion || material.descripcion;
            material.costoPorMetro = req.body.costoPorMetro !== undefined ? req.body.costoPorMetro : material.costoPorMetro;
            material.unidadMedida = req.body.unidadMedida || material.unidadMedida;

            const updatedMaterial = await material.save();
            res.json(updatedMaterial);
        } else {
            res.status(404).json({ message: 'Material no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar material:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de material inválido.' });
        }
        res.status(500).json({ message: 'Error al actualizar material.', error: error.message });
    }
};

// @desc    Eliminar un material
// @route   DELETE /api/catalogos/materiales/:id
// @access  Private (Admin, Gerente)
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (material) {
            await material.deleteOne();
            res.json({ message: 'Material eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Material no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar material:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de material inválido.' });
        }
        res.status(500).json({ message: 'Error al eliminar material.', error: error.message });
    }
};

module.exports = {
    getMateriales,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
