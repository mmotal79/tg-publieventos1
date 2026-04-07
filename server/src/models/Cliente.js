const mongoose = require('mongoose');
const validator = require('validator'); // Para validación de email y teléfono

const clienteSchema = new mongoose.Schema({
  razonSocial: {
    type: String,
    required: [true, 'La razón social es obligatoria.'],
    trim: true
  },
  numeroIdentificacion: { // RIF, CI, Pasaporte
    type: String,
    required: [true, 'El número de identificación es obligatorio.'],
    unique: true,
    trim: true
  },
  direccionFiscal: {
    type: String,
    required: [true, 'La dirección fiscal es obligatoria.'],
    trim: true
  },
  telefonoContacto: {
    type: String,
    required: [true, 'El teléfono de contacto es obligatorio.'],
    trim: true,
    validate: {
      validator: function(v) {
        return validator.isMobilePhone(v, 'any', { strictMode: false }); // 'any' permite cualquier región, strictMode false para más flexibilidad
      },
      message: props => `${props.value} no es un número de teléfono válido.`
    }
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return validator.isEmail(v);
      },
      message: props => `${props.value} no es un email válido.`
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);
