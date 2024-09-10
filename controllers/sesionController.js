const Usuario = require('../models/usuarioModel');
const Sesion = require('../models/sesionModel');
const bcrypt = require('bcrypt');

// Función para ajustar la hora a UTC-6
const ajustarZonaHoraria = (fechaUTC) => {
  const diferenciaHoraria = -6; // Ajuste para UTC-6
  return new Date(fechaUTC.getTime() + diferenciaHoraria * 60 * 60 * 1000);
};

// Controlador para iniciar sesión
exports.iniciarSesion = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Crear una nueva sesión
    const nuevaSesion = new Sesion({
      idUsuario: usuario.idMySQL,
      inicioSesion: ajustarZonaHoraria(new Date()), // Ajuste a UTC-6
      direccionIP: req.ip,
      informacion_dispositivo: {
        sistemaOperativo: req.headers['user-agent'],
        navegador: "Chrome",
        tipoDispositivo: "Escritorio"
      }
    });

    // Guardar la sesión en la base de datos
    await nuevaSesion.save();

    // Responder con los detalles de la sesión
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
    // Buscar la sesión en la base de datos
    const sesion = await Sesion.findById(idSesion);
    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Ajustar la hora de cierre de sesión
    sesion.finSesion = ajustarZonaHoraria(new Date()); // Ajuste a UTC-6
    await sesion.save();

    // Responder con los detalles del cierre de sesión
    res.json({ message: 'Sesión cerrada', finSesion: sesion.finSesion });

  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
