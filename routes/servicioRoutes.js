// routes/servicioRoutes.js
const express = require('express');
const servicioController = require('../controllers/servicioController');
const router = express.Router();

router.get('/', servicioController.getServicios);
router.get('/:id', servicioController.getServicioById);
router.post('/', servicioController.createServicio);
router.put('/:id', servicioController.updateServicio);
router.delete('/:id', servicioController.deleteServicio);

module.exports = router;