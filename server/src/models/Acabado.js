const mongoose = require('mongoose');

const acabadoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del acabado es obligatorio.'],
        unique: true,
        trim: true,
        maxlength: [100, 'El nombre del acabado no puede exceder los 100 caracteres.']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción del acabado no puede exceder los 500 caracteres.']
    },
    costoUnitario: { // Campo crucial para los cálculos de presupuesto
        type: Number,
        required: [true, 'El costo unitario del acabado es obligatorio.'],
        min: [0, 'El costo unitario no puede ser negativo.']
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

acabadoSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('Acabado', acabadoSchema);
