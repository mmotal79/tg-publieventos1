const mongoose = require('mongoose');

const disenoModeloSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del diseño/modelo es obligatorio.'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre del diseño/modelo no puede exceder los 100 caracteres.']
  },
  tipoPrenda: {
    type: String,
    required: [true, 'El tipo de prenda es obligatorio.'],
    enum: ['Camisa', 'Franela', 'Franelilla', 'Chaqueta', 'Jersey', 'Pantalón', 'Short', 'Mono', 'Otro'],
    trim: true,
    maxlength: [50, 'El tipo de prenda no puede exceder los 50 caracteres.']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres.']
  },
  nivelComplejidad: {
    type: String,
    enum: ['Bajo', 'Medio', 'Alto', 'Muy Alto'],
    default: 'Bajo',
    maxlength: [20, 'El nivel de complejidad no puede exceder los 20 caracteres.']
  },
  tiempoEstimadoConfeccionMin: { // En minutos
    type: Number,
    required: [true, 'El tiempo estimado de confección es obligatorio.'],
    min: [0, 'El tiempo estimado no puede ser negativo.']
  },
  factorCostoAdicional: { // Factor multiplicador sobre costo base por complejidad
    type: Number,
    required: [true, 'El factor de costo adicional es obligatorio.'],
    default: 0,
    min: [0, 'El factor de costo adicional no puede ser negativo.']
  },
  costoUnitarioBase: { // Costo base del diseño/modelo (ej. costo de confección sin tela ni corte)
    type: Number,
    required: [true, 'El costo unitario base del diseño/modelo es obligatorio.'],
    min: [0, 'El costo unitario base no puede ser negativo.']
  },
  consumoTelaPorPrendaMetros: { // NUEVO CAMPO: Consumo de tela por prenda en metros lineales
    type: Number,
    required: [true, 'El consumo de tela por prenda en metros es obligatorio.'],
    min: [0.01, 'El consumo de tela debe ser un número positivo.'] // Mínimo para evitar división por cero o consumo nulo
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fechaActualizacion antes de guardar/actualizar
disenoModeloSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

disenoModeloSchema.pre('findOneAndUpdate', function(next) {
    this._update.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('DisenoModelo', disenoModeloSchema);
