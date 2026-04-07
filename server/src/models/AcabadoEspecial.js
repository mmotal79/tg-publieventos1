const mongoose = require('mongoose');

const acabadoEspecialSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del acabado especial es obligatorio.'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  costoPorUnidad: {
    type: Number,
    required: [true, 'El costo por unidad del acabado especial es obligatorio.'],
    min: [0, 'El costo no puede ser negativo.']
  }
});

module.exports = mongoose.model('AcabadoEspecial', acabadoEspecialSchema);
