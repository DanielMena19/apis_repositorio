const express = require('express');
const router = express.Router();
const sesionController = require('../controllers/sesionController');  // Asegúrate de que la ruta es correcta

// Verifica que las funciones estén definidas en el controlador
router.post('/iniciar', sesionController.iniciarSesion);
router.post('/cerrar', sesionController.cerrarSesion);

module.exports = router;
