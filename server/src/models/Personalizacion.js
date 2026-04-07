const mongoose = require('mongoose');

// Esquema base de Personalizacion
const personalizacionSchema = new mongoose.Schema({
  tipo: { // Discriminator key para diferenciar entre Bordado y Estampado
    type: String,
    required: [true, 'El tipo de personalización es obligatorio.'],
    enum: ['Bordado', 'Estampado']
  },
  nombre: { // Ej: "Logo Pequeño", "Escudo Grande"
    type: String,
    required: [true, 'El nombre de la personalización es obligatorio.'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre de la personalización no puede exceder los 100 caracteres.'] // Añadido
  },
  ubicacion: { // Ej: "Pecho Izquierdo", "Espalda Completa", "Manga Derecha"
    type: String,
    required: [true, 'La ubicación es obligatoria.'],
    trim: true,
    maxlength: [100, 'La ubicación no puede exceder los 100 caracteres.'] // Añadido
  },
  costoBase: { // Costo base por esta personalización (antes de aplicar factores específicos de bordado/estampado)
    type: Number,
    required: [true, 'El costo base de la personalización es obligatorio.'],
    min: [0, 'El costo base no puede ser negativo.']
  },
  fechaCreacion: { // Añadido para auditoría
    type: Date,
    default: Date.now
  },
  fechaActualizacion: { // Añadido para auditoría
    type: Date,
    default: Date.now
  }
}, { discriminatorKey: 'tipo', collection: 'personalizaciones' }); // 'collection' para unificar en una colección

// Middleware para actualizar la fechaActualizacion antes de guardar/actualizar
personalizacionSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

personalizacionSchema.pre('findOneAndUpdate', function(next) {
    this._update.fechaActualizacion = Date.now();
    next();
});


// Modelo base de Personalizacion
const Personalizacion = mongoose.model('Personalizacion', personalizacionSchema);

// Sub-modelo para Bordado (discriminador)
const bordadoSchema = new mongoose.Schema({
  numPuntadasEstimadas: {
    type: Number,
    required: [true, 'El número de puntadas estimadas es obligatorio para bordados.'],
    min: [0, 'El número de puntadas no puede ser negativo.']
  },
  numColores: {
    type: Number,
    required: [true, 'El número de colores es obligatorio para bordados.'],
    min: [1, 'El número de colores debe ser al menos 1.']
  },
  costoProgramaPonchado: { // Costo único por digitalización del diseño (ponchado)
    type: Number,
    required: [true, 'El costo de ponchado es obligatorio para bordados.'],
    default: 0,
    min: [0, 'El costo de ponchado no puede ser negativo.']
  },
  factorComplejidad: { // Impacto en el tiempo/recursos del bordado
    type: String,
    enum: ['Simple', 'Medio', 'Complejo', 'Muy Complejo'],
    default: 'Simple',
    maxlength: [50, 'El factor de complejidad no puede exceder los 50 caracteres.'] // Añadido
  }
});

// Añadir el esquema de Bordado como un discriminador de Personalizacion
const Bordado = Personalizacion.discriminator('Bordado', bordadoSchema);

// Sub-modelo para Estampado (discriminador)
const estampadoSchema = new mongoose.Schema({
  metodo: {
    type: String,
    required: [true, 'El método de estampado es obligatorio.'],
    enum: ['Serigrafia', 'Sublimacion', 'Vinil Textil'],
    maxlength: [50, 'El método de estampado no puede exceder los 50 caracteres.'] // Añadido
  },
  numColores: { // Más relevante para serigrafía
    type: Number,
    min: [1, 'El número de colores debe ser al menos 1.'],
    default: 1
  },
  tamano: { // Ej: "Pequeño", "Mediano", "Grande", "Extra Grande"
    type: String,
    enum: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'],
    default: 'Mediano',
    maxlength: [50, 'El tamaño no puede exceder los 50 caracteres.'] // Añadido
  },
  costoPantallaPorColor: { // Para serigrafía: costo por cada pantalla de color
    type: Number,
    default: 0,
    min: [0, 'El costo de pantalla no puede ser negativo.']
  },
  costoPorCm2: { // Para sublimación/vinil: costo por centímetro cuadrado
    type: Number,
    required: [true, 'El costo por cm2 es obligatorio para estampados.'],
    min: [0, 'El costo por cm2 no puede ser negativo.']
  }
});

// Añadir el esquema de Estampado como un discriminador de Personalizacion
const Estampado = Personalizacion.discriminator('Estampado', estampadoSchema);

module.exports = { Personalizacion, Bordado, Estampado };
