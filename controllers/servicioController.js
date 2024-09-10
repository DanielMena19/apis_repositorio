// controllers/servicioController.js
const db = require('../config/db');

// Obtener todos los servicios
exports.getServicios = (req, res) => {
  const sql = 'SELECT * FROM servicios';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los servicios' });
    }
    res.json(result);
  });
};

// Obtener un servicio por ID
exports.getServicioById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM servicios WHERE idServ = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el servicio' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear un nuevo servicio
exports.createServicio = (req, res) => {
  const { nombreServ, descripcionServ, duracionServ, precioServ } = req.body;

  // Validación simple
  if (!nombreServ || !duracionServ || !precioServ) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO servicios (nombreServ, descripcionServ, duracionServ, precioServ) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombreServ, descripcionServ, duracionServ, precioServ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al crear el servicio' });
    }

    // Retornar el servicio creado
    res.json({
      idServ: result.insertId,
      nombreServ,
      descripcionServ,
      duracionServ,
      precioServ
    });
  });
};

// Actualizar un servicio
exports.updateServicio = (req, res) => {
  const { id } = req.params;
  const { nombreServ, descripcionServ, duracionServ, precioServ } = req.body;

  if (!nombreServ || !duracionServ || !precioServ) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sqlUpdate = 'UPDATE servicios SET nombreServ = ?, descripcionServ = ?, duracionServ = ?, precioServ = ? WHERE idServ = ?';
  db.query(sqlUpdate, [nombreServ, descripcionServ, duracionServ, precioServ, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el servicio' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Obtener los datos actualizados
    const sqlSelect = 'SELECT * FROM servicios WHERE idServ = ?';
    db.query(sqlSelect, [id], (err, updatedResult) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el servicio actualizado' });
      }

      res.json({
        message: 'Servicio actualizado exitosamente',
        servicio: updatedResult[0]  // Devolver el servicio actualizado
      });
    });
  });
};

// Eliminar un servicio
exports.deleteServicio = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM servicios WHERE idServ = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el servicio' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado' });
  });
};
