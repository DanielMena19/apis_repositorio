// controllers/usuarioController.js
const Usuario = require('../models/usuarioModel');
const Counter = require('../models/counterModel');
const bcrypt = require('bcrypt');

// Función para ajustar la hora a UTC-6
const ajustarZonaHoraria = (fechaUTC) => {
  const diferenciaHoraria = -6; // Ajuste para UTC-6
  return new Date(fechaUTC.getTime() + diferenciaHoraria * 60 * 60 * 1000);
};

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por idMySQL
exports.getUsuarioByIdMySQL = async (req, res) => {
  const { idMySQL } = req.params;

  try {
    const usuario = await Usuario.findOne({ idMySQL });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear un nuevo usuario con autoincremento para idMySQL
exports.createUsuario = async (req, res) => {
  const { nombreUsuario, correo, contrasena, rol, infoContacto, puesto } = req.body;

  if (!nombreUsuario || !correo || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si el nombreUsuario o correo ya existen
    const usuarioExistente = await Usuario.findOne({ $or: [{ nombreUsuario }, { correo }] });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario o correo ya existe' });
    }

    // Incrementar el contador para idMySQL
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'idMySQL' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }  // Si no existe, lo crea
    );

    const nuevoUsuario = new Usuario({
      idMySQL: counter.seq,
      nombreUsuario,
      correo,
      contrasena,  // Será encriptada en el pre-save hook
      rol,
      infoContacto,
      puesto,
      fechaRegistro: ajustarZonaHoraria(new Date()), // Ajuste a UTC-6
      ultimoInicioSesion: ajustarZonaHoraria(new Date()) // Ajuste a UTC-6
    });

    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'El nombre de usuario o correo ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el usuario', details: err.message });
  }
};


// Actualizar un usuario por idMySQL
exports.updateUsuario = async (req, res) => {
  const { idMySQL } = req.params;  // Obtener el idMySQL desde los parámetros de la URL
  const { nombreUsuario, correo, contrasena, rol, infoContacto, puesto, ultimoInicioSesion } = req.body;

  try {
    // Verificar si el nombreUsuario o correo ya existen en otro usuario
    const [usuarioConMismoNombre, usuarioConMismoCorreo] = await Promise.all([
      Usuario.findOne({ nombreUsuario, idMySQL: { $ne: idMySQL } }),
      Usuario.findOne({ correo, idMySQL: { $ne: idMySQL } })
    ]);

    if (usuarioConMismoNombre) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    if (usuarioConMismoCorreo) {
      return res.status(400).json({ error: 'El correo ya existe' });
    }

    // Buscar el usuario por idMySQL
    const usuario = await Usuario.findOne({ idMySQL });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar los campos
    usuario.nombreUsuario = nombreUsuario || usuario.nombreUsuario;
    usuario.correo = correo || usuario.correo;
    
    if (contrasena) {
      // Solo encriptar si la contraseña ha sido cambiada
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena = await bcrypt.hash(contrasena, salt);
    }

    usuario.rol = rol || usuario.rol;
    usuario.infoContacto = infoContacto || usuario.infoContacto;
    usuario.puesto = puesto || usuario.puesto;
    usuario.ultimoInicioSesion = ultimoInicioSesion ? ajustarZonaHoraria(new Date(ultimoInicioSesion)) : usuario.ultimoInicioSesion;

    // Guardar los cambios
    const usuarioActualizado = await usuario.save();
    res.json(usuarioActualizado);

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el usuario', details: err.message });
  }
};

// Eliminar un usuario por idMySQL
exports.deleteUsuarioByIdMySQL = async (req, res) => {
  const { idMySQL } = req.params;

  try {
    const usuarioEliminado = await Usuario.findOneAndDelete({ idMySQL });
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
