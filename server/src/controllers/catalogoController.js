const Tela = require('../models/Tela');
const DisenoModelo = require('../models/DisenoModelo');
const TipoCorte = require('../models/TipoCorte');
const { Personalizacion, Bordado, Estampado } = require('../models/Personalizacion');
const AcabadoEspecial = require('../models/AcabadoEspecial');
const ConfigGlobal = require('../models/ConfigGlobal');
const { validationResult } = require('express-validator');

// --- Funciones genéricas CRUD para modelos de catálogo ---
const createOne = async (Model, req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    // Manejo específico para errores de duplicidad de Mongoose (código 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: `El ${Model.modelName} ya existe.`, error: error.message });
    }
    res.status(500).json({ message: `Error al crear ${Model.modelName}.`, error: error.message });
  }
};

const getAll = async (Model, req, res) => {
  try {
    const items = await Model.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener ${Model.modelName}s.`, error: error.message });
  }
};

const getOneById = async (Model, req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: `${Model.modelName} no encontrado.` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al obtener ${Model.modelName}.`, error: error.message });
  }
};

const updateOne = async (Model, req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const item = await Model.findById(req.params.id);
    if (item) {
      // Actualizar solo los campos que se envían en el body
      Object.assign(item, req.body);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: `${Model.modelName} no encontrado.` });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `El ${Model.modelName} ya existe con ese nombre.`, error: error.message });
    }
    res.status(500).json({ message: `Error al actualizar ${Model.modelName}.`, error: error.message });
  }
};

const deleteOne = async (Model, req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: `${Model.modelName} eliminado correctamente.` });
    } else {
      res.status(404).json({ message: `${Model.modelName} no encontrado.` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar ${Model.modelName}.`, error: error.message });
  }
};

// --- Controladores específicos por cada Catálogo ---

// Telas
const createTela = (req, res) => createOne(Tela, req, res);
const getTelas = (req, res) => getAll(Tela, req, res);
const getTelaById = (req, res) => getOneById(Tela, req, res);
const updateTela = (req, res) => updateOne(Tela, req, res);
const deleteTela = (req, res) => deleteOne(Tela, req, res);

// Diseños/Modelos
const createDisenoModelo = (req, res) => createOne(DisenoModelo, req, res);
const getDisenosModelos = (req, res) => getAll(DisenoModelo, req, res);
const getDisenoModeloById = (req, res) => getOneById(DisenoModelo, req, res);
const updateDisenoModelo = (req, res) => updateOne(DisenoModelo, req, res);
const deleteDisenoModelo = (req, res) => deleteOne(DisenoModelo, req, res);

// Tipos de Corte
const createTipoCorte = (req, res) => createOne(TipoCorte, req, res);
const getTiposCorte = (req, res) => getAll(TipoCorte, req, res);
const getTipoCorteById = (req, res) => getOneById(TipoCorte, req, res);
const updateTipoCorte = (req, res) => updateOne(TipoCorte, req, res);
const deleteTipoCorte = (req, res) => deleteOne(TipoCorte, req, res);

// Personalizaciones (Bordado y Estampado)
const createPersonalizacion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { tipo } = req.body;
  let Model;
  if (tipo === 'Bordado') {
    Model = Bordado;
  } else if (tipo === 'Estampado') {
    Model = Estampado;
  } else {
    return res.status(400).json({ message: 'Tipo de personalización inválido.' });
  }
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `La personalización ya existe con ese nombre.`, error: error.message });
    }
    res.status(500).json({ message: `Error al crear personalización de tipo ${tipo}.`, error: error.message });
  }
};
const getPersonalizaciones = async (req, res) => getAll(Personalizacion, req, res); // Obtiene todos los discriminadores
const getPersonalizacionById = (req, res) => getOneById(Personalizacion, req, res);
const updatePersonalizacion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const item = await Personalizacion.findById(req.params.id);
      if (item) {
        // Actualizar solo los campos que se envían en el body
        Object.assign(item, req.body);
        const updatedItem = await item.save();
        res.json(updatedItem);
      } else {
        res.status(404).json({ message: `Personalización no encontrada.` });
      }
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: `La personalización ya existe con ese nombre.`, error: error.message });
      }
      res.status(500).json({ message: `Error al actualizar personalización.`, error: error.message });
    }
};
const deletePersonalizacion = (req, res) => deleteOne(Personalizacion, req, res);


// Acabados Especiales
const createAcabadoEspecial = (req, res) => createOne(AcabadoEspecial, req, res);
const getAcabadosEspeciales = (req, res) => getAll(AcabadoEspecial, req, res);
const getAcabadoEspecialById = (req, res) => getOneById(AcabadoEspecial, req, res);
const updateAcabadoEspecial = (req, res) => updateOne(AcabadoEspecial, req, res); // Esta línea está bien si updateOne se encarga de la lógica.

const deleteAcabadoEspecial = (req, res) => deleteOne(AcabadoEspecial, req, res);


// Configuración Global
// @desc    Obtener configuración global (debería haber solo una)
// @route   GET /api/config
// @access  Private/Admin/Gerente
const getConfigGlobal = async (req, res) => {
  try {
    const config = await ConfigGlobal.findOne({}); // Busca el primer (y único) documento
    if (!config) {
        // Si no existe, crear una configuración por defecto
        const defaultConfig = await ConfigGlobal.create({
            nombreConfig: 'Default',
            margenGanancia: 0.20, // Asegúrate de que estos valores sean los que quieres por defecto
            impuestoIVA: 0.16,
            factoresVolumen: [
                { min: 1, max: 10, factor: 1.5 },
                { min: 11, max: 50, factor: 1.2 },
                { min: 51, max: 200, factor: 1.0 },
                { min: 201, max: 500, factor: 0.9 },
                { min: 501, max: 9999999, factor: 0.8 }
            ],
            costoPlanchadoUnidad: 0.5,
            costoEmpaqueUnidad: 0.15,
            opcionesEmpaque: [
                { nombre: "Ninguno", costo: 0 },
                { nombre: "Bolsa Plástica", costo: 0.15 },
                { nombre: "Bolsa con Logo", costo: 0.40 },
                { nombre: "Caja Individual", costo: 1.00 }
            ],
            factoresUrgencia: [
                { tipo: "Normal", factor: 1.0 },
                { tipo: "Urgente (72h)", factor: 1.2 },
                { tipo: "Muy Urgente (24h)", factor: 1.5 }
            ],
            costoDisenoGraficoBase: 50,
            costoMuestraFisicaBase: 25,
        });
        return res.status(200).json(defaultConfig);
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración global.', error: error.message });
  }
};

// Función para actualizar la configuración global (o crearla si no existe)
const updateConfigGlobal = async (req, res) => { // CAMBIO: de exports.updateConfigGlobal a const updateConfigGlobal
  try {
    const config = await ConfigGlobal.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        runValidators: true,
        upsert: true
      }
    );

    if (!config) {
      return res.status(500).json({ message: 'Error interno: No se pudo encontrar ni crear la configuración global.' });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error('Error al actualizar/crear la configuración global:', error);
    res.status(500).json({ message: 'Error al actualizar/crear la configuración global.', error: error.message });
  }
};

module.exports = {
  createTela, getTelas, getTelaById, updateTela, deleteTela,
  createDisenoModelo, getDisenosModelos, getDisenoModeloById, updateDisenoModelo, deleteDisenoModelo,
  createTipoCorte, getTiposCorte, getTipoCorteById, updateTipoCorte, deleteTipoCorte,
  createPersonalizacion, getPersonalizaciones, getPersonalizacionById, updatePersonalizacion, deletePersonalizacion,
  createAcabadoEspecial, getAcabadosEspeciales, getAcabadoEspecialById, updateAcabadoEspecial, deleteAcabadoEspecial,
  getConfigGlobal,
  updateConfigGlobal // Ya que ahora es una 'const', debe ser listada aquí.
};
