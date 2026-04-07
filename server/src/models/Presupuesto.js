const mongoose = require('mongoose');

// Esquema de sub-documento para los ítems de cada presupuesto
const itemPresupuestoSchema = new mongoose.Schema({
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es obligatoria.'],
    min: [1, 'La cantidad debe ser al menos 1.']
  },
  talla: {
    type: String,
    required: [true, 'La talla es obligatoria.'],
    trim: true
  },
  tela: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tela',
    required: [true, 'La tela es obligatoria.']
  },
  disenoModelo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DisenoModelo',
    required: [true, 'El diseño/modelo es obligatorio.']
  },
  tipoCorte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoCorte',
    required: [true, 'El tipo de corte es obligatorio.']
  },
  personalizaciones: [{ // Array de IDs de personalizaciones (Bordado o Estampado)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personalizacion' // Se referenciará al modelo base
  }],
  acabadosEspeciales: [{ // Array de IDs de acabados especiales
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcabadoEspecial'
  }],
  costoUnitarioCalculado: { // Este valor se calculará y guardará en el backend
    type: Number,
    default: 0,
    min: [0, 'El costo unitario calculado no puede ser negativo.']
  },
  subtotal: { // Cantidad * costoUnitarioCalculado
    type: Number,
    default: 0,
    min: [0, 'El subtotal no puede ser negativo.']
  }
}, { _id: false }); // No crear _id para sub-documentos si no se necesita acceso directo

// Esquema principal de Presupuesto
const presupuestoSchema = new mongoose.Schema({
  correlativo: {
    type: String,
    required: [true, 'El correlativo es obligatorio.'],
    unique: true,
    trim: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es obligatorio.']
  },
  items: [itemPresupuestoSchema], // Array de sub-documentos de ítems
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  montoTotal: { // Suma de todos los subtotales de los ítems
    type: Number,
    default: 0,
    min: [0, 'El monto total no puede ser negativo.']
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Aprobado', 'Rechazado', 'En Producción', 'Finalizado'],
    default: 'Pendiente'
  },
  creadoPor: { // Referencia al usuario que creó el presupuesto
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador del presupuesto es obligatorio.']
  },
  notas: {
    type: String,
    trim: true
  },
  opcionesAdicionales: { // Para el planchado, empaquetado, etc.
    planchado: { type: Boolean, default: false },
    tipoEmpaque: { type: String, enum: ['Ninguno', 'Bolsa Plástica', 'Bolsa con Logo', 'Caja Individual'], default: 'Ninguno' },
    plazoEntrega: { type: String, enum: ['Normal', 'Urgente (72h)', 'Muy Urgente (24h)'], default: 'Normal' },
    requiereDisenoGrafico: { type: Boolean, default: false },
    requiereMuestraFisica: { type: Boolean, default: false }
  }
}, { timestamps: true }); // Mongoose añade createdAt y updatedAt automáticamente

// Middleware para actualizar fechaActualizacion cada vez que se guarde el presupuesto
presupuestoSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

module.exports = mongoose.model('Presupuesto', presupuestoSchema);
