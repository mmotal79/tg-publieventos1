const Acabado = require('../models/Acabado');
const { validationResult } = require('express-validator');

// @desc    Obtener todos los acabados
// @route   GET /api/catalogos/acabados
// @access  Private (Asesor, Gerente, Admin)
const getAcabados = async (req, res) => {
    try {
        const acabados = await Acabado.find({});
        res.json(acabados);
    } catch (error) {
        console.error('Error al obtener acabados:', error);
        res.status(500).json({ message: 'Error al obtener acabados.', error: error.message });
    }
};

// @desc    Obtener un acabado por ID
// @route   GET /api/catalogos/acabados/:id
// @access  Private (Asesor, Gerente, Admin)
const getAcabadoById = async (req, res) => {
    try {
        const acabado = await Acabado.findById(req.params.id);
        if (acabado) {
            res.json(acabado);
        } else {
            res.status(404).json({ message: 'Acabado no encontrado.' });
        }
    } catch (error) {
        console.error(`Error al obtener acabado con ID ${req.params.id}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de acabado inválido.' });
        }
        res.status(500).json({ message: 'Error al obtener acabado.', error: error.message });
    }
};

// @desc    Crear un nuevo acabado
// @route   POST /api/catalogos/acabados
// @access  Private (Admin, Gerente)
const createAcabado = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion, costoUnitario } = req.body;

    try {
        const acabadoExists = await Acabado.findOne({ nombre });
        if (acabadoExists) {
            return res.status(400).json({ message: 'Ya existe un acabado con este nombre.' });
        }

        const acabado = await Acabado.create({
            nombre,
            descripcion,
            costoUnitario
        });

        res.status(201).json(acabado);
    } catch (error) {
        console.error('Error al crear acabado:', error);
        res.status(500).json({ message: 'Error al crear acabado.', error: error.message });
    }
};

// @desc    Actualizar un acabado
// @route   PUT /api/catalogos/acabados/:id
// @access  Private (Admin, Gerente)
const updateAcabado = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const acabado = await Acabado.findById(req.params.id);

        if (acabado) {
            // Check if an acabado with the new name already exists (excluding the current acabado)
            if (req.body.nombre && req.body.nombre !== acabado.nombre) {
                const existingAcabado = await Acabado.findOne({ nombre: req.body.nombre });
                if (existingAcabado && existingAcabado._id.toString() !== acabado._id.toString()) {
                    return res.status(400).json({ message: 'Ya existe otro acabado con este nombre.' });
                }
            }

            acabado.nombre = req.body.nombre || acabado.nombre;
            acabado.descripcion = req.body.descripcion || acabado.descripcion;
            acabado.costoUnitario = req.body.costoUnitario !== undefined ? req.body.costoUnitario : acabado.costoUnitario;

            const updatedAcabado = await acabado.save();
            res.json(updatedAcabado);
        } else {
            res.status(404).json({ message: 'Acabado no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar acabado:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de acabado inválido.' });
        }
        res.status(500).json({ message: 'Error al actualizar acabado.', error: error.message });
    }
};

// @desc    Eliminar un acabado
// @route   DELETE /api/catalogos/acabados/:id
// @access  Private (Admin, Gerente)
const deleteAcabado = async (req, res) => {
    try {
        const acabado = await Acabado.findById(req.params.id);

        if (acabado) {
            await acabado.deleteOne();
            res.json({ message: 'Acabado eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Acabado no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar acabado:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de acabado inválido.' });
        }
        res.status(500).json({ message: 'Error al eliminar acabado.', error: error.message });
    }
};

module.exports = {
    getAcabados,
    getAcabadoById,
    createAcabado,
    updateAcabado,
    deleteAcabado
};
