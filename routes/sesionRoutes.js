const express = require('express');
const router = express.Router();
const { login } = require('../controllers/sesionController'); // Importar correctamente el controlador

// Ruta para el login
router.post('/login', login); // Asegúrate de que 'login' está bien importado y definido

module.exports = router;
