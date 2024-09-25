const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel'); // Usar tu modelo de usuario

// Controlador de login
exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  // Validación básica de datos
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Por favor, proporciona correo y contraseña.' });
  }

  try {
    // Buscar el usuario por correo en la base de datos
    const usuario = await Usuario.findOne({ correo });

    // Si el usuario no existe, enviar un error 404
    if (!usuario) {
      return res.status(404).json({ error: 'Alguno de los datos es incorrecto' });
    }

    // Verificar la contraseña comparando la proporcionada con la encriptada
    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Alguno de los datos es incorrecto' });
    }

    // Actualizar la fecha del último inicio de sesión
    usuario.ultimoInicioSesion = new Date();
    await usuario.save();

    // Opcional: Generar un token JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol }, // Puedes agregar más datos si es necesario
      'clave_secreta', // Debes usar una clave secreta más segura y almacenarla en .env
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    // Responder con el token y los datos del usuario
    res.status(200).json({
      message: 'Login exitoso',
      token, // Enviar el token JWT
      usuario: {
        nombre: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol,
        ultimoInicioSesion: usuario.ultimoInicioSesion,
      },
    });
  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
