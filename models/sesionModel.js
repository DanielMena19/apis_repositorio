const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
  idUsuario: {
    type: Number,  // Cambiamos ObjectId a Number para referenciar el idMySQL
    required: true
  },
  inicioSesion: {
    type: Date,
    default: Date.now
  },
  finSesion: {
    type: Date
  },
  direccionIP: {
    type: String,
    required: true
  },
  informacion_dispositivo: {
    sistemaOperativo: { type: String, default: null },
    navegador: { type: String, default: null },
    tipoDispositivo: { type: String, default: null }
  }
});

const Sesion = mongoose.model('Sesion', sesionSchema);

module.exports = Sesion;
