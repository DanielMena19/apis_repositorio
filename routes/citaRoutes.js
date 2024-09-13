const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');  // Asegúrate de que la ruta es correcta

// Verifica que las funciones existan y estén bien definidas
router.get('/', citaController.getCitas);  // Obtener todas las citas
router.get('/:idCita', citaController.getCitaById);  // Obtener una cita por ID
router.post('/', citaController.createCita);  // Crear una nueva cita
router.put('/:idCita', citaController.updateCita);  // Editar los datos de la cita
router.put('/:idCita/estado', citaController.updateEstadoCita);  // Actualizar solo el estado de la cita

module.exports = router;
