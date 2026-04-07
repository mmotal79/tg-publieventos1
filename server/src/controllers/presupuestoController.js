const Presupuesto = require('../models/Presupuesto');
const Cliente = require('../models/Cliente');
const Tela = require('../models/Tela');
const DisenoModelo = require('../models/DisenoModelo');
const TipoCorte = require('../models/TipoCorte');
const { Personalizacion } = require('../models/Personalizacion');
const AcabadoEspecial = require('../models/AcabadoEspecial');
const ConfigGlobal = require('../models/ConfigGlobal');
const { validationResult } = require('express-validator');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.vfs;

const fs = require('fs').promises; // Para leer archivos de forma asíncrona
const path = require('path');     // Para resolver rutas de archivos

// --- Funciones Auxiliares de Cálculo de Costos ---

/**
 * Calcula el costo unitario y subtotal de un ítem de presupuesto, incluyendo todos los costos por unidad (excepto IVA).
 * Esto significa que el margen de ganancia, porciones de costos fijos (diseño, muestra),
 * y efectos de factores globales (volumen, urgencia, empaque, planchado) se distribuyen por unidad aquí.
 * @param {Object} item - El objeto del ítem del presupuesto (debe incluir cantidad).
 * @param {Object} opcionesAdicionalesGlobal - Las opciones adicionales a nivel de presupuesto.
 * @param {Number} totalUnidadesGlobal - La cantidad total de unidades en todo el presupuesto.
 * @returns {Object} Un objeto con el costoUnitarioCalculado (final por unidad, sin IVA) y el subtotal (final por ítem, sin IVA).
 * @throws {Error} Si faltan datos críticos de catálogo.
 */
async function calcularCostoItem(item, opcionesAdicionalesGlobal, totalUnidadesGlobal) {
    // Recuperar documentos de Mongoose
    const [telaDoc, disenoModeloDoc, tipoCorteDoc, personalizacionesDocs, acabadosEspecialesDocs, configGlobalDoc] = await Promise.all([
        Tela.findById(item.tela).select('nombre costoPorUnidad unidadMedida anchoTelaMetros'),
        DisenoModelo.findById(item.disenoModelo).select('nombre tipoPrenda nivelComplejidad tiempoEstimadoConfeccionMin factorCostoAdicional costoUnitarioBase consumoTelaPorPrendaMetros'),
        TipoCorte.findById(item.tipoCorte).select('tipo descripcion factorConsumoTela factorTiempoConfeccion costoPorUnidad'),
        Personalizacion.find({ _id: { $in: item.personalizaciones } }).select('nombre tipo ubicacion costoBase numPuntadasEstimadas numColores costoProgramaPonchado metodo tamano costoPantallaPorColor costoPorCm2'),
        AcabadoEspecial.find({ _id: { $in: item.acabadosEspeciales } }).select('nombre descripcion costoPorUnidad'),
        ConfigGlobal.findOne({})
    ]);

    // Convertir todos los documentos de Mongoose a objetos planos para asegurar acceso directo a las propiedades
    const tela = telaDoc ? telaDoc.toObject() : null;
    const disenoModelo = disenoModeloDoc ? disenoModeloDoc.toObject() : null;
    const tipoCorte = tipoCorteDoc ? tipoCorteDoc.toObject() : null;
    const personalizaciones = personalizacionesDocs.map(doc => doc.toObject());
    const acabadosEspeciales = acabadosEspecialesDocs.map(doc => doc.toObject());
    const config = configGlobalDoc ? configGlobalDoc.toObject() : null;

    // Verificación de existencia de documentos principales
    if (!tela || !disenoModelo || !tipoCorte || !config) {
        throw new Error('Datos de catálogo incompletos para el cálculo del ítem. Verifique Tela, Diseño/Modelo, Tipo de Corte y Configuración Global.');
    }

    // Verificaciones explícitas de campos críticos
    if (typeof disenoModelo.consumoTelaPorPrendaMetros === 'undefined' || disenoModelo.consumoTelaPorPrendaMetros === null) {
        throw new Error(`Falta el campo 'consumoTelaPorPrendaMetros' en el diseño/modelo '${disenoModelo.nombre}'. Por favor, actualice el documento en la base de datos.`);
    }
    if (typeof tela.anchoTelaMetros === 'undefined' || tela.anchoTelaMetros === null) {
        throw new Error(`Falta el campo 'anchoTelaMetros' en la tela '${tela.nombre}'. Por favor, actualice el documento en la base de datos.`);
    }
    if (typeof disenoModelo.costoUnitarioBase === 'undefined' || disenoModelo.costoUnitarioBase === null) {
        throw new Error(`Falta el campo 'costoUnitarioBase' en el diseño/modelo '${disenoModelo.nombre}'. Por favor, actualice el documento en la base de datos.`);
    }
    if (typeof tipoCorte.costoPorUnidad === 'undefined' || tipoCorte.costoPorUnidad === null) {
        throw new Error(`Falta el campo 'costoPorUnidad' en el tipo de corte '${tipoCorte.tipo}'. Por favor, actualice el documento en la base de datos.`);
    }

    // --- CÁLCULO DEL COSTO UNITARIO BASE (antes de factores globales y margen) ---
    let costoUnitarioBase = disenoModelo.costoUnitarioBase ?? 0;

    // Costo de la tela por prenda
    const costoPorUnidadTela = tela.costoPorUnidad ?? 0;
    const anchoTela = tela.anchoTelaMetros ?? 0;
    const consumoTela = disenoModelo.consumoTelaPorPrendaMetros ?? 0;
    let costoTelaPorPrenda = 0;
    if (anchoTela > 0) {
        costoTelaPorPrenda = (costoPorUnidadTela / anchoTela) * consumoTela;
    } else {
        console.warn(`Advertencia: Ancho de tela (${tela.nombre}) es cero o no válido. El costo de tela por prenda será 0.`);
    }
    costoUnitarioBase += costoTelaPorPrenda;

    // Costo por el tipo de corte
    costoUnitarioBase += tipoCorte.costoPorUnidad ?? 0;

    // Aplicar factor de complejidad del diseño/modelo
    const factorCostoAdicional = disenoModelo.factorCostoAdicional ?? 0;
    costoUnitarioBase *= (1 + factorCostoAdicional);

    // Aplicar factor de consumo de tela por tipo de corte
    const factorConsumoTela = tipoCorte.factorConsumoTela ?? 1;
    costoUnitarioBase *= factorConsumoTela; 

    // Costo de personalizaciones
    let costoPersonalizaciones = 0;
    for (const pers of personalizaciones) {
        let persCosto = pers.costoBase ?? 0;
        if (pers.tipo === 'Bordado') {
            persCosto += pers.costoProgramaPonchado ?? 0;
        } else if (pers.tipo === 'Estampado') {
            persCosto += pers.costoPantallaPorColor ?? 0;
            persCosto += (pers.costoPorCm2 ?? 0);
        }
        costoPersonalizaciones += persCosto;
    }
    costoUnitarioBase += costoPersonalizaciones;

    // Costo de acabados especiales
    let costoAcabadosEspeciales = 0;
    for (const acabado of acabadosEspeciales) {
        costoAcabadosEspeciales += acabado.costoPorUnidad ?? 0;
    }
    costoUnitarioBase += costoAcabadosEspeciales;

    // --- Acumular porciones de costos globales y factores al costo unitario base ---
    let costosAdicionalesUnitarios = 0; // Esta es la "variable suplementaria"

    // Costo por Planchado (por unidad)
    if (opcionesAdicionalesGlobal && opcionesAdicionalesGlobal.planchado) {
        costosAdicionalesUnitarios += (config.costoPlanchadoUnidad ?? 0);
    }

    // Costo por Empaque (por unidad)
    if (opcionesAdicionalesGlobal && opcionesAdicionalesGlobal.tipoEmpaque !== 'Ninguno') {
        const empaqueSeleccionado = config.opcionesEmpaque.find(opt => opt.nombre === opcionesAdicionalesGlobal.tipoEmpaque);
        if (empaqueSeleccionado) {
            costosAdicionalesUnitarios += (empaqueSeleccionado.costo ?? 0);
        }
    }

    // Costo por Diseño Gráfico (distribuido por unidad del total del pedido)
    if (opcionesAdicionalesGlobal && opcionesAdicionalesGlobal.requiereDisenoGrafico) {
        if (totalUnidadesGlobal > 0) {
            costosAdicionalesUnitarios += (config.costoDisenoGraficoBase ?? 0) / totalUnidadesGlobal;
        }
    }

    // Costo por Muestra Física (distribuido por unidad del total del pedido)
    if (opcionesAdicionalesGlobal && opcionesAdicionalesGlobal.requiereMuestraFisica) {
        if (totalUnidadesGlobal > 0) {
            costosAdicionalesUnitarios += (config.costoMuestraFisicaBase ?? 0) / totalUnidadesGlobal;
        }
    }

    // Sumar la variable suplementaria al costo unitario base
    let nuevoCostoUnitario = costoUnitarioBase + costosAdicionalesUnitarios;

    // --- Aplicar factores multiplicadores globales al nuevo costo unitario ---
    // Factor por volumen (se aplica al costo unitario del ítem)
    let factorVolumen = 1.0;
    const cantidadItem = item.cantidad ?? 0;
    if (config.factoresVolumen && config.factoresVolumen.length > 0) {
        for (const factor of config.factoresVolumen) {
            const min = factor.min ?? 0;
            const max = factor.max ?? Infinity;
            if (cantidadItem >= min && cantidadItem <= max) { // Factor de volumen basado en la cantidad del ítem
                factorVolumen = factor.factor ?? 1.0;
                break;
            }
        }
    }
    nuevoCostoUnitario *= factorVolumen;

    // Factor por urgencia (se aplica al nuevo costo unitario)
    let factorUrgencia = 1.0;
    if (opcionesAdicionalesGlobal && opcionesAdicionalesGlobal.plazoEntrega !== 'Normal') {
        const urgenciaSeleccionada = config.factoresUrgencia.find(opt => opt.tipo === opcionesAdicionalesGlobal.plazoEntrega);
        if (urgenciaSeleccionada) {
            factorUrgencia = urgenciaSeleccionada.factor ?? 1.0;
        }
    }
    nuevoCostoUnitario *= factorUrgencia;

    // Aplicar margen de ganancia al nuevo costo unitario
    nuevoCostoUnitario *= (1 + (config.margenGanancia ?? 0));

    // Calcular subtotal para este ítem
    const subtotal = nuevoCostoUnitario * (item.cantidad ?? 0);

    return { costoUnitarioCalculado: nuevoCostoUnitario, subtotal: subtotal };
}

/**
 * Calcula el monto total del presupuesto sumando los subtotales de los ítems y aplicando el IVA.
 * Asume que los subtotales de los ítems ya incluyen todos los demás costos y márgenes.
 * @param {Object} presupuesto - El objeto del presupuesto con ítems ya calculados.
 * @returns {Number} El monto total calculado del presupuesto.
 * @throws {Error} Si la configuración global no se encuentra.
 */
async function calcularMontoTotalPresupuesto(presupuesto) {
    const configGlobalDoc = await ConfigGlobal.findOne({});
    const config = configGlobalDoc ? configGlobalDoc.toObject() : null;

    if (!config) throw new Error('Configuración global no encontrada para el cálculo final.');

    let subtotalPedidoSinIVA = 0;
    for (const item of presupuesto.items) {
        subtotalPedidoSinIVA += item.subtotal ?? 0;
    }

    // Aplicar impuesto IVA al subtotal del pedido
    const montoTotal = subtotalPedidoSinIVA * (1 + (config.impuestoIVA ?? 0));
    
    return montoTotal;
}

/**
 * Genera un correlativo único para un nuevo presupuesto.
 * Formato: PRE-YYMM-NNNN
 * @returns {string} El nuevo correlativo.
 */
async function generateCorrelativo() {
    const lastPresupuesto = await Presupuesto.findOne().sort({ fechaCreacion: -1 }).limit(1);
    let lastNumber = 0;
    if (lastPresupuesto && lastPresupuesto.correlativo) {
        const parts = lastPresupuesto.correlativo.split('-');
        if (parts.length === 3 && parts[0] === 'PRE' && parts[1].length === 4) {
            lastNumber = parseInt(parts[2], 10);
        }
    }
    const today = new Date();
    const year = today.getFullYear().toString().slice(2, 4);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');

    return `PRE-${year}${month}-${newNumber}`;
}

/**
 * Convierte una imagen local a una cadena Base64 para incrustar en el PDF.
 * La ruta es relativa al archivo actual (presupuestoController.js).
 * Por ejemplo, '../../public/assets/logoTG.png' si está en backend/public/assets.
 * @param {string} imageRelativePath - Ruta relativa de la imagen desde el directorio del controlador.
 * @returns {Promise<string>} Cadena Base64 de la imagen (con prefijo data URI), o cadena vacía si falla.
 */
async function imageToBase64(imageRelativePath) {
    try {
        // __dirname es el directorio del archivo actual (presupuestoController.js)
        // La ruta del logo es '../../public/assets/logoTG.png'
        const fullPath = path.join(__dirname, imageRelativePath);
        const imageBuffer = await fs.readFile(fullPath);
        const mimeType = `image/${path.extname(imageRelativePath).substring(1)}`;
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error(`Error al convertir imagen a Base64 desde ${imageRelativePath}:`, error.message);
        return '';
    }
}


// --- Controladores CRUD para Presupuestos ---

/**
 * @desc    Obtener todos los presupuestos (con filtros y paginación si se quiere en el futuro)
 * @route   GET /api/presupuestos
 * @access  Private (Asesor, Gerente, Admin)
 */
const getPresupuestos = async (req, res) => {
    try {
        const { clienteId, estado, fechaInicio, fechaFin } = req.query;
        let query = {};

        if (clienteId) {
            query.cliente = clienteId;
        }
        if (estado) {
            query.estado = estado;
        }
        if (fechaInicio || fechaFin) {
            query.fechaCreacion = {};
            if (fechaInicio) {
                query.fechaCreacion.$gte = new Date(fechaInicio);
            }
            if (fechaFin) {
                const dateFin = new Date(fechaFin);
                dateFin.setHours(23, 59, 59, 999);
                query.fechaCreacion.$lte = dateFin;
            }
        }

        const presupuestos = await Presupuesto.find(query)
            .populate('cliente', 'razonSocial numeroIdentificacion email telefonoContacto')
            .populate('creadoPor', 'nombre email rol')
            .sort({ fechaCreacion: -1 });

        res.json(presupuestos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener presupuestos.', error: error.message });
    }
};

/**
 * @desc    Obtener un presupuesto por ID
 * @route   GET /api/presupuestos/:id
 * @access  Private (Asesor, Gerente, Admin, Cliente si es su presupuesto)
 */
const getPresupuestoById = async (req, res) => {
    try {
        const presupuesto = await Presupuesto.findById(req.params.id)
            .populate('cliente', 'razonSocial numeroIdentificacion email telefonoContacto direccionFiscal')
            .populate('creadoPor', 'nombre email rol')
            .populate({
                path: 'items.tela',
                select: 'nombre costoPorUnidad unidadMedida anchoTelaMetros'
            })
            .populate({
                path: 'items.disenoModelo',
                select: 'nombre tipoPrenda nivelComplejidad costoUnitarioBase consumoTelaPorPrendaMetros'
            })
            .populate({
                path: 'items.tipoCorte',
                select: 'tipo costoPorUnidad factorConsumoTela'
            })
            .populate({
                path: 'items.personalizaciones',
                select: 'nombre tipo ubicacion costoBase numPuntadasEstimadas numColores costoProgramaPonchado metodo tamano costoPantallaPorColor costoPorCm2'
            })
            .populate({
                path: 'items.acabadosEspeciales',
                select: 'nombre costoPorUnidad'
            });

        if (presupuesto) {
            if (req.user.rol === 'cliente' && presupuesto.cliente._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Acceso denegado. No tiene permiso para ver este presupuesto.' });
            }
            res.json(presupuesto);
        } else {
            res.status(404).json({ message: 'Presupuesto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener presupuesto.', error: error.message });
    }
};

/**
 * @desc    Crear un nuevo presupuesto
 * @route   POST /api/presupuestos
 * @access  Private (Asesor, Gerente, Admin)
 */
const createPresupuesto = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { cliente, nombreProyecto, fechaEntregaEstimada, estado, items, notas, opcionesAdicionales } = req.body;

    try {
        const existingCliente = await Cliente.findById(cliente);
        if (!existingCliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        const newCorrelativo = await generateCorrelativo();

        let newPresupuesto = new Presupuesto({
            correlativo: newCorrelativo,
            cliente: cliente,
            nombreProyecto,
            fechaEntregaEstimada,
            estado: estado || 'Pendiente',
            items: [],
            creadoPor: req.user._id,
            notas,
            opcionesAdicionales
        });

        // Calcular el total de unidades de todo el pedido para distribuir costos fijos
        const totalUnidadesGlobal = items.reduce((sum, item) => sum + (item.cantidad ?? 0), 0);

        for (let item of items) {
            const { costoUnitarioCalculado, subtotal } = await calcularCostoItem(
                item,
                opcionesAdicionales, // Pasamos las opciones adicionales del presupuesto
                totalUnidadesGlobal  // Pasamos el total de unidades del presupuesto
            );
            newPresupuesto.items.push({
                cantidad: item.cantidad,
                talla: item.talla,
                tela: item.tela,
                disenoModelo: item.disenoModelo,
                tipoCorte: item.tipoCorte,
                personalizaciones: item.personalizaciones,
                acabadosEspeciales: item.acabadosEspeciales,
                costoUnitarioCalculado: parseFloat(costoUnitarioCalculado.toFixed(2)),
                subtotal: parseFloat(subtotal.toFixed(2))
            });
        }

        newPresupuesto.montoTotal = parseFloat((await calcularMontoTotalPresupuesto(newPresupuesto)).toFixed(2));

        const createdPresupuesto = await newPresupuesto.save();

        const populatedPresupuesto = await Presupuesto.findById(createdPresupuesto._id)
            .populate('cliente', 'razonSocial numeroIdentificacion email telefonoContacto direccionFiscal')
            .populate('creadoPor', 'nombre email rol')
            .populate({ path: 'items.tela', select: 'nombre' })
            .populate({ path: 'items.disenoModelo', select: 'nombre' })
            .populate({ path: 'items.tipoCorte', select: 'tipo' })
            .populate({ path: 'items.personalizaciones', select: 'nombre tipo' })
            .populate({ path: 'items.acabadosEspeciales', select: 'nombre' });


        res.status(201).json(populatedPresupuesto);
    } catch (error) {
        console.error('Error al crear presupuesto:', error);
        res.status(500).json({ message: 'Error al crear presupuesto.', error: error.message });
    }
};

/**
 * @desc    Actualizar un presupuesto existente
 * @route   PUT /api/presupuestos/:id
 * @access  Private (Asesor, Gerente, Admin)
 */
const updatePresupuesto = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { cliente, nombreProyecto, fechaEntregaEstimada, items, notas, estado, opcionesAdicionales } = req.body;

    try {
        const presupuesto = await Presupuesto.findById(req.params.id);

        if (!presupuesto) {
            return res.status(404).json({ message: 'Presupuesto no encontrado.' });
        }

        if (cliente && cliente.toString() !== presupuesto.cliente.toString()) {
            const newCliente = await Cliente.findById(cliente);
            if (!newCliente) {
                return res.status(404).json({ message: 'El nuevo cliente no existe.' });
            }
            presupuesto.cliente = cliente;
        }

        // Calcular el total de unidades de todo el pedido para distribuir costos fijos
        const totalUnidadesGlobal = items.reduce((sum, item) => sum + (item.cantidad ?? 0), 0);

        if (items && Array.isArray(items)) {
            presupuesto.items = [];
            for (let item of items) {
                const { costoUnitarioCalculado, subtotal } = await calcularCostoItem(
                    item,
                    opcionesAdicionales, // Pasamos las opciones adicionales del presupuesto
                    totalUnidadesGlobal  // Pasamos el total de unidades del presupuesto
                );
                presupuesto.items.push({
                    cantidad: item.cantidad,
                    talla: item.talla,
                    tela: item.tela,
                    disenoModelo: item.disenoModelo,
                    tipoCorte: item.tipoCorte,
                    personalizaciones: item.personalizaciones,
                    acabadosEspeciales: item.acabadosEspeciales,
                    costoUnitarioCalculado: parseFloat(costoUnitarioCalculado.toFixed(2)),
                    subtotal: parseFloat(subtotal.toFixed(2))
                });
            }
        }

        if (nombreProyecto !== undefined) presupuesto.nombreProyecto = nombreProyecto;
        if (fechaEntregaEstimada !== undefined) presupuesto.fechaEntregaEstimada = fechaEntregaEstimada;
        if (notas !== undefined) presupuesto.notas = notas;
        if (estado !== undefined) presupuesto.estado = estado;
        if (opcionesAdicionales !== undefined) {
            presupuesto.opcionesAdicionales = {
                ...presupuesto.opcionesAdicionales,
                ...opcionesAdicionales
            };
        }

        presupuesto.montoTotal = parseFloat((await calcularMontoTotalPresupuesto(presupuesto)).toFixed(2));

        const updatedPresupuesto = await presupuesto.save();

        const populatedPresupuesto = await Presupuesto.findById(updatedPresupuesto._id)
            .populate('cliente', 'razonSocial numeroIdentificacion email telefonoContacto direccionFiscal')
            .populate('creadoPor', 'nombre email rol')
            .populate({ path: 'items.tela', select: 'nombre' })
            .populate({ path: 'items.disenoModelo', select: 'nombre' })
            .populate({ path: 'items.tipoCorte', select: 'tipo' })
            .populate({ path: 'items.personalizaciones', select: 'nombre tipo' })
            .populate({ path: 'items.acabadosEspeciales', select: 'nombre' });

        res.json(populatedPresupuesto);
    } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        res.status(500).json({ message: 'Error al actualizar presupuesto.', error: error.message });
    }
};

/**
 * @desc    Eliminar un presupuesto
 * @route   DELETE /api/presupuestos/:id
 * @access  Private (Admin, Gerente)
 */
const deletePresupuesto = async (req, res) => {
    try {
        const presupuesto = await Presupuesto.findById(req.params.id);

        if (presupuesto) {
            await presupuesto.deleteOne();
            res.json({ message: 'Presupuesto eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Presupuesto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar presupuesto.', error: error.message });
    }
};

/**
 * @desc    Generar PDF de un presupuesto
 * @route   GET /api/presupuestos/:id/pdf
 * @access  Private (Asesor, Gerente, Admin, Cliente si es su presupuesto)
 */
const generatePresupuestoPdf = async (req, res) => {
    try {
        const presupuesto = await Presupuesto.findById(req.params.id)
            .populate('cliente', 'razonSocial numeroIdentificacion email telefonoContacto direccionFiscal')
            .populate('creadoPor', 'nombre email')
            .populate({
                path: 'items.tela',
                select: 'nombre'
            })
            .populate({
                path: 'items.disenoModelo',
                select: 'nombre tipoPrenda'
            })
            .populate({
                path: 'items.tipoCorte',
                select: 'tipo'
            })
            .populate({
                path: 'items.personalizaciones',
                select: 'nombre tipo metodo'
            })
            .populate({
                path: 'items.acabadosEspeciales',
                select: 'nombre'
            });

        if (!presupuesto) {
            return res.status(404).json({ message: 'Presupuesto no encontrado.' });
        }

        // Lógica de autorización para clientes
        if (req.user.rol === 'cliente' && presupuesto.cliente._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Acceso denegado. No tiene permiso para generar el PDF de este presupuesto.' });
        }

        // --- Recuperar Configuración Global para cálculos y detalles del PDF ---
        const configGlobalDoc = await ConfigGlobal.findOne({});
        const config = configGlobalDoc ? configGlobalDoc.toObject() : null;
        if (!config) {
            throw new Error('Configuración global no encontrada para generar el PDF.');
        }

        // --- Obtener datos de variables de entorno para el encabezado ---
        const empresaDiseno = process.env.EMPRESA_DISENO || 'Nombre de Empresa No Configurado';
        const rifEmpresaDiseno = process.env.RIF_EMPRESA_DISENO || 'RIF No Configurado';
        const direccionEmpresaDiseno = process.env.DIRECCION_EMPRESA_DISENO || 'Dirección No Configurada';
        const tipoDocPresupuestoEmpresa = process.env.TIPO_DOC_PRESUPUESTO_EMPRESA || 'Presupuesto de Uniformes y Diseños';
        // Asegurarse de que la ruta en el .env NO tenga un '/' inicial si es relativa
        const rutaLogoDiseno = process.env.RUTA_LOGO_DISENO || '../../public/assets/logoTG.png'; // Ruta por defecto

        // --- Obtener logo en Base64 ---
        let logoBase64 = '';
        try {
            logoBase64 = await imageToBase64(rutaLogoDiseno);
        } catch (logoError) {
            console.error(`Error al cargar el logo desde ${rutaLogoDiseno}:`, logoError.message);
            // Continuar sin el logo si hay un error
        }

        // --- Cálculos para el desglose de totales en el PDF ---
        const impuestoIVAPorcentaje = config.impuestoIVA ?? 0;

        // El SUBTOTAL PEDIDO es la suma de los subtotales de los ítems (que ya incluyen todo excepto IVA)
        const subtotalPedidoCalculado = presupuesto.items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);

        // Calcular el monto de IVA sobre el SUBTOTAL PEDIDO
        const montoIVACalculado = subtotalPedidoCalculado * impuestoIVAPorcentaje;

        // El TOTAL PRESUPUESTO final es el SUBTOTAL PEDIDO más el monto de IVA
        const totalPresupuestoFinalCalculado = subtotalPedidoCalculado + montoIVACalculado;

        // Usaremos el montoTotal guardado en DB como la fuente de verdad final para el PDF.
        // Si hay una discrepancia, ajustaremos el SUBTOTAL PEDIDO y el IVA para que la suma sea consistente.
        let finalSubtotalPedidoDisplay = subtotalPedidoCalculado;
        let finalMontoIVADisplay = montoIVACalculado;
        const totalPresupuestoDB = presupuesto.montoTotal;

        // Ajuste para asegurar que SUBTOTAL PEDIDO + IVA = TOTAL PRESUPUESTO de la DB
        if (Math.abs(totalPresupuestoDB - totalPresupuestoFinalCalculado) > 0.01) { // Tolerancia por redondeo
            console.warn('Discrepancia detectada entre el total calculado para PDF y el total guardado en DB. Ajustando valores para consistencia.');
            finalSubtotalPedidoDisplay = totalPresupuestoDB / (1 + impuestoIVAPorcentaje);
            finalMontoIVADisplay = totalPresupuestoDB - finalSubtotalPedidoDisplay;
            console.log(`IVA en DB: ${finalMontoIVADisplay.toFixed(2)} vs Calculado: ${montoIVACalculado.toFixed(2)}`);
            console.log(`Subtotal Pedido en DB: ${finalSubtotalPedidoDisplay.toFixed(2)} vs Calculado: ${subtotalPedidoCalculado.toFixed(2)}`);
        } else {
            console.log('Los cálculos de IVA y Subtotal Pedido coinciden con el Total Presupuesto de la DB.');
        }


        // --- Definición del Documento PDF ---
        const docDefinition = {
            // Encabezado del documento
            header: {
                columns: [
                    // Columna única para el logo centrado en la cabecera
                    {
                        image: logoBase64 || '', // Usar cadena vacía si no hay logo
                        width: logoBase64 ? 120 : 0, // dimensiones (120 -> 60)
                        height: logoBase64 ? 120 : 0, // dimensiones
                        alignment: 'center',
                        margin: [0, 25, 0, 0]
                    },
					{ width: '*', text: '' } // Columna flexible derecha para centrar
                ]
            },
            content: [
                // Espacio para bajar el contenido principal después del encabezado (logo)
                // Este margen asegura que el contenido no se solape con el encabezado dinámico del logo
                { text: '', margin: [0, 0, 0, logoBase64 ? 0 : 0] }, // Ajusta este valor si el encabezado es más alto/bajo

                // Información de la empresa y título del documento (nueva sección después del encabezado)
                { text: empresaDiseno, alignment: 'center', fontSize: 24, bold: true, color: '#FF0000', margin: [0, 0, 0, 2] },
                { text: rifEmpresaDiseno, alignment: 'center', fontSize: 10, color: '#000000', margin: [0, 0, 0, 2] },
                { text: direccionEmpresaDiseno, alignment: 'center', fontSize: 10, color: '#000000', margin: [0, 0, 0, 10] },
                { text: tipoDocPresupuestoEmpresa, alignment: 'center', fontSize: 16, bold: true, color: '#000000', margin: [0, 10, 0, 15] },

                // Información del presupuesto
                { text: `Correlativo: ${presupuesto.correlativo}`, style: 'subheader' },
                { text: `Estado: ${presupuesto.estado}`, style: 'subheader' },
                { text: `Fecha de Generación: ${presupuesto.fechaCreacion.toLocaleDateString('es-ES')}`, style: 'dateInfo', margin: [0, 0, 0, 15] },

                // Datos del Cliente
                { text: 'Datos del Cliente:', style: 'sectionHeader' },
                {
                    ul: [
                        `Razón Social: ${presupuesto.cliente.razonSocial}`,
                        `Número Identificación: ${presupuesto.cliente.numeroIdentificacion}`,
                        `Dirección Fiscal: ${presupuesto.cliente.direccionFiscal}`,
                        `Teléfono: ${presupuesto.cliente.telefonoContacto}`,
                        `Email: ${presupuesto.cliente.email}`
                    ],
                    margin: [0, 5, 0, 15]
                },

                // Detalle de Ítems
                { text: 'Detalle de Ítems:', style: 'sectionHeader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Cantidad', 'Descripción del Pedido', 'Talla', 'Costo Unitario', 'Subtotal'],
                            ...presupuesto.items.map(item => {
                                // Construir la descripción detallada del ítem
                                const itemDescription = [
                                    { text: `${item.disenoModelo.nombre} (${item.disenoModelo.tipoPrenda}, ${item.tela.nombre}, Corte ${item.tipoCorte.tipo})`, bold: true },
                                    // Personalizaciones
                                    ...(item.personalizaciones && item.personalizaciones.length > 0 ? [{
                                        text: `Personalización: ${item.personalizaciones.map(p => {
                                            let pDetail = p.nombre;
                                            if (p.tipo === 'Bordado') pDetail += ' (Bordado)';
                                            if (p.tipo === 'Estampado' && p.metodo) pDetail += ` (Estampado - ${p.metodo})`;
                                            return pDetail;
                                        }).join(', ')}`, fontSize: 9, margin: [0, 2, 0, 0]
                                    }] : []),
                                    // Acabados Especiales
                                    ...(item.acabadosEspeciales && item.acabadosEspeciales.length > 0 ? [{
                                        text: `Acabados: ${item.acabadosEspeciales.map(a => a.nombre).join(', ')}`, fontSize: 9, margin: [0, 2, 0, 0]
                                    }] : []),
                                    // Opciones Adicionales Globales (por ítem para claridad)
                                    (presupuesto.opcionesAdicionales.planchado ? { text: 'Incluye Planchado', fontSize: 9, margin: [0, 2, 0, 0] } : null),
                                    (presupuesto.opcionesAdicionales.tipoEmpaque !== 'Ninguno' ? { text: `Empaque: ${presupuesto.opcionesAdicionales.tipoEmpaque}`, fontSize: 9, margin: [0, 2, 0, 0] } : null),
                                    (presupuesto.opcionesAdicionales.requiereDisenoGrafico ? { text: 'Requiere Diseño Gráfico', fontSize: 9, margin: [0, 2, 0, 0] } : null),
                                    (presupuesto.opcionesAdicionales.requiereMuestraFisica ? { text: 'Requiere Muestra Física', fontSize: 9, margin: [0, 2, 0, 0] } : null),
                                    (presupuesto.opcionesAdicionales.plazoEntrega !== 'Normal' ? { text: `Plazo de Entrega: ${presupuesto.opcionesAdicionales.plazoEntrega}`, fontSize: 9, margin: [0, 2, 0, 0] } : null),
                                    // Si tuvieras un campo para "variaciones/adaptaciones" en el esquema del ítem, lo añadirías aquí.
                                    // Ejemplo: (item.variaciones ? { text: `Variaciones: ${item.variaciones}`, fontSize: 9, margin: [0,2,0,0] } : null)
                                ].filter(Boolean); // Filtra elementos nulos si no se cumplen las condiciones

                                return [
                                    item.cantidad,
                                    { stack: itemDescription }, // Usar stack para múltiples líneas en la descripción
                                    item.talla,
                                    `$${item.costoUnitarioCalculado.toFixed(2)}`, // Costo unitario ya incluye margen, sin IVA
                                    `$${item.subtotal.toFixed(2)}` // Subtotal ya incluye margen, sin IVA
                                ];
                            }),
                            // Fila de SUBTOTAL PEDIDO
                            [{ text: 'SUBTOTAL PEDIDO', colSpan: 4, alignment: 'right', bold: true, fontSize: 12 }, {}, {}, {}, `$${finalSubtotalPedidoDisplay.toFixed(2)}`]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },

                // Sección de IVA y Total Final
                {
                    style: 'tableTotals',
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            // IVA
                            [{ text: `IVA (${(impuestoIVAPorcentaje * 100).toFixed(0)}%):`, alignment: 'right', bold: true, fontSize: 12 }, `$${finalMontoIVADisplay.toFixed(2)}`],
                            // TOTAL PRESUPUESTO
                            [{ text: 'TOTAL PRESUPUESTO:', style: 'totalAmountCell' }, { text: `$${totalPresupuestoDB.toFixed(2)}`, style: 'totalAmountCell' }]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 5, 0, 15]
                },

                { text: `Notas: ${presupuesto.notas || 'N/A'}`, style: 'notes', margin: [0, 20, 0, 0] },
                { text: `Creado por: ${presupuesto.creadoPor.nombre} (${presupuesto.creadoPor.email || 'email no disponible'})`, style: 'footer', margin: [0, 10, 0, 0] },
                { text: `Fecha de Creación: ${presupuesto.fechaCreacion.toLocaleDateString('es-ES')}`, style: 'footer' }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 10]
                },
                subheader: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 2, 0, 2]
                },
                dateInfo: {
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5],
                    color: '#0056b3'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableTotals: {
                    margin: [0, 5, 0, 15],
                    fontSize: 12
                },
                totalAmountCell: {
                    fontSize: 16,
                    bold: true,
                    color: '#0056b3'
                },
                notes: {
                    fontSize: 10,
                    italics: true,
                    color: '#555'
                },
                footer: {
                    fontSize: 9,
                    color: '#777',
                    alignment: 'right'
                }
            },
            defaultStyle: {
                columnGap: 20
            }
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);

        pdfDoc.getBase64((data) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment;filename=presupuesto-${presupuesto.correlativo}.pdf`
            });
            const download = Buffer.from(data.toString('utf-8'), 'base64');
            res.end(download);
        });

    } catch (error) {
        console.error('Error al generar PDF del presupuesto:', error);
        res.status(500).json({ message: 'Error al generar el PDF del presupuesto.', error: error.message });
    }
};


module.exports = {
    getPresupuestos,
    getPresupuestoById,
    createPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    generatePresupuestoPdf
};
