const Usuario = require('../models/usuarioModel');
const Sesion = require('../models/sesionModel');
const bcrypt = require('bcrypt');

// Controlador para iniciar sesión
exports.iniciarSesion = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const nuevaSesion = new Sesion({
      idUsuario: usuario.idMySQL,
      direccionIP: req.ip,
      informacion_dispositivo: {
        sistemaOperativo: req.headers['user-agent'],
        navegador: "Chrome",
        tipoDispositivo: "Escritorio"
      }
    });

    await nuevaSesion.save();

    res.json({
      message: 'Sesión iniciada',
      idSesion: nuevaSesion._id,
      idUsuario: usuario.idMySQL,
      inicioSesion: nuevaSesion.inicioSesion
    });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Controlador para cerrar sesión
exports.cerrarSesion = async (req, res) => {
  const { idSesion } = req.body;

  try {
    const sesion = await Sesion.findById(idSesion);
    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    sesion.finSesion = Date.now();
    await sesion.save();

    res.json({ message: 'Sesión cerrada', finSesion: sesion.finSesion });
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

