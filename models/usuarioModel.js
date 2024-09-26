// models/usuarioModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Esquema del Usuario
const usuarioSchema = new mongoose.Schema({
  idMySQL: { type: Number, unique: true },
  nombreUsuario: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, enum: ['Admin', 'Staff'], required: true },
  infoContacto: String,
  puesto: String,
  fechaRegistro: { type: Date, default: Date.now },
  ultimoInicioSesion: Date
});

// Encriptar la contraseña antes de guardar el usuario
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();  // Si la contraseña no ha cambiado, sigue al siguiente middleware

  try {
    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
