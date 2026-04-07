// Autor: Ing. Miguel Mota
// Fecha de Creación: 27/08/2025 20:12
// Nombre del Archivo: configGlobalController.js (Control de cambio y secuencia N° 001: Implementación de controlador CRUD para Configuración Global)

const ConfigGlobal = require('../models/ConfigGlobal'); // Asegúrate de que la ruta sea correcta
const { validationResult } = require('express-validator');

// @desc    Obtener la configuración global (solo hay una)
// @route   GET /api/catalogos/config-global
// @access  Public (se puede ajustar a Private si se necesita protección)
const getConfigGlobal = async (req, res) => {
  try {
    const config = await ConfigGlobal.findOne({}); // Busca la única configuración
    if (!config) {
      // Si no existe, crea una con los valores por defecto
      const defaultConfig = new ConfigGlobal({});
      await defaultConfig.save();
      return res.status(200).json(defaultConfig);
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la configuración global.', error: error.message });
  }
};

// @desc    Actualizar la configuración global
// @route   PUT /api/catalogos/config-global
// @access  Private/Admin
const updateConfigGlobal = async (req, res) => {
  // Manejo de errores de validación de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      margenGanancia,
      impuestoIVA,
      factoresVolumen,
      opcionesEmpaque,
      factoresUrgencia,
      costoDisenoGraficoBase,
      costoMuestraFisicaBase
    } = req.body;

    const config = await ConfigGlobal.findOne({});

    if (config) {
      // Actualiza los campos existentes
      config.margenGanancia = margenGanancia !== undefined ? margenGanancia : config.margenGanancia;
      config.impuestoIVA = impuestoIVA !== undefined ? impuestoIVA : config.impuestoIVA;
      config.factoresVolumen = factoresVolumen !== undefined ? factoresVolumen : config.factoresVolumen;
      config.opcionesEmpaque = opcionesEmpaque !== undefined ? opcionesEmpaque : config.opcionesEmpaque;
      config.factoresUrgencia = factoresUrgencia !== undefined ? factoresUrgencia : config.factoresUrgencia;
      config.costoDisenoGraficoBase = costoDisenoGraficoBase !== undefined ? costoDisenoGraficoBase : config.costoDisenoGraficoBase;
      config.costoMuestraFisicaBase = costoMuestraFisicaBase !== undefined ? costoMuestraFisicaBase : config.costoMuestraFisicaBase;

      // Guarda la configuración actualizada
      const updatedConfig = await config.save();
      res.json(updatedConfig);
    } else {
      res.status(404).json({ message: 'Configuración global no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la configuración global.', error: error.message });
  }
};

module.exports = {
  getConfigGlobal,
  updateConfigGlobal
};
