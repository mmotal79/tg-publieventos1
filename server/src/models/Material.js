const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del material es obligatorio.'],
        unique: true, // Para asegurar que no haya materiales con el mismo nombre
        trim: true,
        maxlength: [100, 'El nombre del material no puede exceder los 100 caracteres.']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción del material no puede exceder los 500 caracteres.']
    },
    costoPorMetro: { // Campo crucial para los cálculos de presupuesto
        type: Number,
        required: [true, 'El costo por metro del material es obligatorio.'],
        min: [0, 'El costo por metro no puede ser negativo.']
    },
    unidadMedida: { // Por ejemplo: "metro", "kg", "unidad"
        type: String,
        required: [true, 'La unidad de medida es obligatoria.'],
        enum: ['metro', 'yarda', 'kg', 'libra', 'unidad'], // Puedes ajustar estas opciones
        trim: true
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

// Middleware para actualizar la fechaActualizacion antes de guardar
materialSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model('Material', materialSchema);
