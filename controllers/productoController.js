// controllers/productoController.js
const connectDB = require('../config/db');  // Importar la función para conectar a MySQL

// Obtener todos los productos
exports.getProductos = async (req, res) => {
  const sql = 'SELECT * FROM productos';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql);  // Ejecutar la consulta
    res.json(result);
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos', details: err.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM productos WHERE idProd = ?';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [id]);  // Ejecutar la consulta
    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result[0]);
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el producto', details: err.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  const { nombreProd, descripcionProd, precioProd, inventarioProd } = req.body;

  if (!nombreProd || !precioProd || !inventarioProd) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO productos (nombreProd, descripcionProd, precioProd, inventarioProd) VALUES (?, ?, ?, ?)';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [nombreProd, descripcionProd, precioProd, inventarioProd]);  // Ejecutar la consulta
    res.status(201).json({
      idProd: result.insertId,
      nombreProd,
      descripcionProd,
      precioProd,
      inventarioProd
    });
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el producto', details: err.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombreProd, descripcionProd, precioProd, inventarioProd } = req.body;

  const sqlSelect = 'SELECT * FROM productos WHERE idProd = ?';
  const sqlUpdate = `
    UPDATE productos 
    SET nombreProd = ?, descripcionProd = ?, precioProd = ?, inventarioProd = ? 
    WHERE idProd = ?
  `;

  try {
    const db = await connectDB();  // Conectar a la base de datos

    // Obtener el producto actual
    const [result] = await db.execute(sqlSelect, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActual = result[0];

    // Usar los valores actuales si no se proporcionan en la solicitud
    const nuevoNombreProd = nombreProd || productoActual.nombreProd;
    const nuevaDescripcionProd = descripcionProd || productoActual.descripcionProd;
    const nuevoPrecioProd = precioProd || productoActual.precioProd;
    const nuevoInventarioProd = inventarioProd || productoActual.inventarioProd;

    // Ejecutar la actualización
    const [updateResult] = await db.execute(sqlUpdate, [
      nuevoNombreProd,
      nuevaDescripcionProd,
      nuevoPrecioProd,
      nuevoInventarioProd,
      id
    ]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener el producto actualizado
    const [updatedResult] = await db.execute(sqlSelect, [id]);
    res.json({
      message: 'Producto actualizado exitosamente',
      producto: updatedResult[0]
    });
    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};


// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE idProd = ?';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado' });
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el producto', details: err.message });
  }
};
