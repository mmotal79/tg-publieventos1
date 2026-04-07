const mongoose = require('mongoose');

const configGlobalSchema = new mongoose.Schema({
  nombreConfig: { // Usaremos un nombre fijo, por ejemplo, "Default"
    type: String,
    default: 'Default',
    unique: true,
    required: [true, 'El nombre de la configuración es obligatorio.'], // Añadido mensaje de error
    trim: true,
    maxlength: [50, 'El nombre de la configuración no puede exceder los 50 caracteres.'] // Añadido
  },
  margenGanancia: {
    type: Number,
    default: 0.20, // Puedes ajustar este valor por defecto si lo deseas
    min: [0, 'El margen de ganancia no puede ser negativo.']
  },
  impuestoIVA: {
    type: Number,
    default: 0.16, // Puedes ajustar este valor por defecto si lo deseas
    min: [0, 'El impuesto IVA no puede ser negativo.']
  },
  factoresVolumen: [ // Array de objetos para rangos de cantidad y su factor de costo
    {
      min: { type: Number, required: [true, 'El valor mínimo es obligatorio.'], min: [0, 'El valor mínimo no puede ser negativo.'] }, // Añadido mensajes
      max: { type: Number, required: [true, 'El valor máximo es obligatorio.'], min: [0, 'El valor máximo no puede ser negativo.'] }, // Añadido mensajes
      factor: { type: Number, required: [true, 'El factor es obligatorio.'], min: [0, 'El factor no puede ser negativo.'] } // Añadido mensajes
    }
  ],
  costoPlanchadoUnidad: {
    type: Number,
    default: 0.5,
    min: [0, 'El costo de planchado no puede ser negativo.']
  },
  costoEmpaqueUnidad: {
    type: Number,
    default: 0.15,
    min: [0, 'El costo de empaque no puede ser negativo.']
  },
  opcionesEmpaque: [{ // Opciones de empaque con nombres y costos específicos
    nombre: { type: String, required: [true, 'El nombre de la opción de empaque es obligatorio.'], trim: true, maxlength: [50, 'El nombre de la opción de empaque no puede exceder los 50 caracteres.'] }, // Añadido
    costo: { type: Number, required: [true, 'El costo de la opción de empaque es obligatorio.'], min: [0, 'El costo de empaque no puede ser negativo.'] } // Añadido
  }],
  factoresUrgencia: [{ // Tipos de plazo de entrega y su factor de recargo
    tipo: { type: String, required: [true, 'El tipo de urgencia es obligatorio.'], unique: true, trim: true, maxlength: [50, 'El tipo de urgencia no puede exceder los 50 caracteres.'] }, // Añadido
    factor: { type: Number, required: [true, 'El factor de urgencia es obligatorio.'], min: [0, 'El factor de urgencia no puede ser negativo.'] } // Añadido
  }],
  costoDisenoGraficoBase: {
    type: Number,
    default: 50,
    min: [0, 'El costo de diseño gráfico no puede ser negativo.']
  },
  costoMuestraFisicaBase: {
    type: Number,
    default: 25,
    min: [0, 'El costo de muestra física no puede ser negativo.']
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
configGlobalSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

configGlobalSchema.pre('findOneAndUpdate', function(next) {
    this._update.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('ConfigGlobal', configGlobalSchema);
