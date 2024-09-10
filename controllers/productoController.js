// controllers/productoController.js
const db = require('../config/db');

// Obtener todos los productos
exports.getProductos = (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.json(result);
  });
};

// Obtener un producto por ID
exports.getProductoById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM productos WHERE idProd = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear un nuevo producto
exports.createProducto = (req, res) => {
  const { nombreProd, descripcionProd, precioProd, inventarioProd } = req.body;

  if (!nombreProd || !precioProd || !inventarioProd) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO productos (nombreProd, descripcionProd, precioProd, inventarioProd) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombreProd, descripcionProd, precioProd, inventarioProd], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al crear el producto' });
    }

    res.json({
      idProd: result.insertId,
      nombreProd,
      descripcionProd,
      precioProd,
      inventarioProd
    });
  });
};

// Actualizar un producto
exports.updateProducto = (req, res) => {
  const { id } = req.params;
  const { nombreProd, descripcionProd, precioProd, inventarioProd } = req.body;

  if (!nombreProd || !precioProd || !inventarioProd) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'UPDATE productos SET nombreProd = ?, descripcionProd = ?, precioProd = ?, inventarioProd = ? WHERE idProd = ?';
  db.query(sql, [nombreProd, descripcionProd, precioProd, inventarioProd, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const sqlSelect = 'SELECT * FROM productos WHERE idProd = ?';
    db.query(sqlSelect, [id], (err, updatedResult) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el producto actualizado' });
      }

      res.json({
        message: 'Producto actualizado exitosamente',
        producto: updatedResult[0]
      });
    });
  });
};

// Eliminar un producto
exports.deleteProducto = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM productos WHERE idProd = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado' });
  });
};
