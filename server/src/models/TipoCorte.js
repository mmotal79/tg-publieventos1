const mongoose = require('mongoose');

const tipoCorteSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: [true, 'El tipo de corte es obligatorio.'],
    unique: true,
    enum: ['Recto', 'Entallado', 'Anatómico', 'Especial'],
    trim: true,
    maxlength: [50, 'El tipo de corte no puede exceder los 50 caracteres.']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres.']
  },
  factorConsumoTela: { // Multiplicador sobre el consumo base de tela
    type: Number,
    required: [true, 'El factor de consumo de tela es obligatorio.'],
    default: 1.0,
    min: [0, 'El factor de consumo de tela no puede ser negativo.']
  },
  factorTiempoConfeccion: { // Multiplicador sobre el tiempo base de confección
    type: Number,
    required: [true, 'El factor de tiempo de confección es obligatorio.'],
    default: 1.0,
    min: [0, 'El factor de tiempo de confección no puede ser negativo.']
  },
  costoPorUnidad: { // CRÍTICO: Añadido para el cálculo en presupuestoController.js
    type: Number,
    required: [true, 'El costo por unidad del tipo de corte es obligatorio.'],
    min: [0, 'El costo por unidad no puede ser negativo.']
  },
  fechaCreacion: { // Añadido para auditoría
    type: Date,
    default: Date.now
  },
  fechaActualizacion: { // Añadido para auditoría
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fechaActualizacion antes de guardar/actualizar
tipoCorteSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

tipoCorteSchema.pre('findOneAndUpdate', function(next) {
    this._update.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('TipoCorte', tipoCorteSchema);
