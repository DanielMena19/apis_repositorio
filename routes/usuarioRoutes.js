// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas para usuarios
router.get('/', usuarioController.getUsuarios);
router.get('/:idMySQL', usuarioController.getUsuarioByIdMySQL);  // Obtener usuario por idMySQL
router.post('/', usuarioController.createUsuario);
router.put('/:idMySQL', usuarioController.updateUsuario);        // Actualizar usuario por idMySQL
router.delete('/:idMySQL', usuarioController.deleteUsuarioByIdMySQL);  // Eliminar usuario por idMySQL

module.exports = router;
