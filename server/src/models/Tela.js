const mongoose = require('mongoose');

const telaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la tela es obligatorio.'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre de la tela no puede exceder los 100 caracteres.'] // Añadido
  },
  composicion: [{ // Array de strings para composición (ej: ["Algodón", "Poliéster"])
    type: String,
    trim: true,
    maxlength: [50, 'Cada componente de la composición no puede exceder los 50 caracteres.'] // Añadido
  }],
  gramaje: { // En gramos por metro cuadrado (gr/m²)
    type: Number,
    required: [true, 'El gramaje es obligatorio.'],
    min: [1, 'El gramaje debe ser un número positivo.']
  },
  propiedades: [{ // Array de strings para propiedades (ej: ["Transpirable", "Impermeable"])
    type: String,
    trim: true,
    maxlength: [50, 'Cada propiedad no puede exceder los 50 caracteres.'] // Añadido
  }],
  costoPorUnidad: { // Costo por metro lineal o kg
    type: Number,
    required: [true, 'El costo por unidad es obligatorio.'],
    min: [0, 'El costo no puede ser negativo.']
  },
  unidadMedida: { // Ej: "metro", "kg"
    type: String,
    enum: ['metro', 'kg'],
    default: 'metro',
    required: [true, 'La unidad de medida es obligatoria.'],
    maxlength: [20, 'La unidad de medida no puede exceder los 20 caracteres.'] // Añadido
  },
  anchoTelaMetros: { // CRÍTICO: Añadido para el cálculo en presupuestoController.js
    type: Number,
    required: [true, 'El ancho de la tela en metros es obligatorio.'],
    min: [0.01, 'El ancho de la tela debe ser un número positivo.'] // Mínimo para evitar división por cero
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
telaSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

telaSchema.pre('findOneAndUpdate', function(next) {
    this._update.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('Tela', telaSchema);
