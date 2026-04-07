const Cliente = require('../models/Cliente');
const { validationResult } = require('express-validator');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private (Asesor, Gerente, Admin)
const getClientes = async (req, res) => {
    try {
        // Filtros por razón social y rango de fechas
        const { razonSocial, fechaInicio, fechaFin } = req.query;
        let query = {};

        if (razonSocial) {
            query.razonSocial = { $regex: razonSocial, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
        }

        if (fechaInicio || fechaFin) {
            query.fechaRegistro = {};
            if (fechaInicio) {
                query.fechaRegistro.$gte = new Date(fechaInicio);
            }
            if (fechaFin) {
                // Añadir 23:59:59.999 para incluir todo el día final
                const dateFin = new Date(fechaFin);
                dateFin.setHours(23, 59, 59, 999);
                query.fechaRegistro.$lte = dateFin;
            }
        }

        const clientes = await Cliente.find(query).sort({ fechaRegistro: -1 }); // Ordenar por fecha de registro descendente

        // --- ¡Deja esta línea de depuración! Es CRÍTICA para diagnosticar ---
        console.log('Clientes encontrados en el controlador:', clientes);
        // ------------------------------------------------------------------

        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes en el controlador:', error);
        res.status(500).json({ message: 'Error al obtener clientes.', error: error.message });
    }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/clientes/:id
// @access  Private (Asesor, Gerente, Admin)
const getClienteById = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (cliente) {
            res.json(cliente);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado.' });
        }
    } catch (error) {
        // Mejorar el log de error para distinguir si es un ID mal formado u otro error
        console.error(`Error al obtener cliente con ID ${req.params.id}:`, error);
        // Si el ID es inválido para MongoDB, Mongoose lanza un CastError
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de cliente inválido.' });
        }
        res.status(500).json({ message: 'Error al obtener cliente.', error: error.message });
    }
};

// @desc    Crear un nuevo cliente
// @route   POST /api/clientes
// @access  Private (Asesor, Gerente, Admin)
const createCliente = async (req, res) => {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { razonSocial, numeroIdentificacion, direccionFiscal, telefonoContacto, email } = req.body;

    try {
        const clienteExists = await Cliente.findOne({ numeroIdentificacion });
        if (clienteExists) {
            return res.status(400).json({ message: 'Ya existe un cliente con este número de identificación.' });
        }
        const clienteEmailExists = await Cliente.findOne({ email });
        if (clienteEmailExists) {
            return res.status(400).json({ message: 'Ya existe un cliente con este email.' });
        }

        const cliente = await Cliente.create({
            razonSocial,
            numeroIdentificacion,
            direccionFiscal,
            telefonoContacto,
            email,
        });

        res.status(201).json(cliente);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ message: 'Error al crear cliente.', error: error.message });
    }
};

// @desc    Actualizar un cliente
// @route   PUT /api/clientes/:id
// @access  Private (Asesor, Gerente, Admin)
const updateCliente = async (req, res) => {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const cliente = await Cliente.findById(req.params.id);

        if (cliente) {
            // Verificar si el nuevo email o numeroIdentificacion ya existe en otro cliente
            const { email, numeroIdentificacion } = req.body;

            if (email && email !== cliente.email) {
                const existingEmail = await Cliente.findOne({ email });
                if (existingEmail && existingEmail._id.toString() !== cliente._id.toString()) {
                    return res.status(400).json({ message: 'Ya existe otro cliente con este email.' });
                }
            }

            if (numeroIdentificacion && numeroIdentificacion !== cliente.numeroIdentificacion) {
                const existingIdentificacion = await Cliente.findOne({ numeroIdentificacion });
                if (existingIdentificacion && existingIdentificacion._id.toString() !== cliente._id.toString()) {
                    return res.status(400).json({ message: 'Ya existe otro cliente con este número de identificación.' });
                }
            }


            cliente.razonSocial = req.body.razonSocial || cliente.razonSocial;
            cliente.numeroIdentificacion = req.body.numeroIdentificacion || cliente.numeroIdentificacion;
            cliente.direccionFiscal = req.body.direccionFiscal || cliente.direccionFiscal;
            cliente.telefonoContacto = req.body.telefonoContacto || cliente.telefonoContacto;
            cliente.email = req.body.email || cliente.email;

            const updatedCliente = await cliente.save();
            res.json(updatedCliente);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        // Manejo de CastError para ID inválido
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de cliente inválido.' });
        }
        res.status(500).json({ message: 'Error al actualizar cliente.', error: error.message });
    }
};

// @desc    Eliminar un cliente
// @route   DELETE /api/clientes/:id
// @access  Private (Asesor, Gerente, Admin)
const deleteCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);

        if (cliente) {
            await cliente.deleteOne();
            res.json({ message: 'Cliente eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        // Manejo de CastError para ID inválido
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de cliente inválido.' });
        }
        res.status(500).json({ message: 'Error al eliminar cliente.', error: error.message });
    }
};

module.exports = { getClientes, getClienteById, createCliente, updateCliente, deleteCliente };
