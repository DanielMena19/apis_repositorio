const connectDB = require('../config/db');  // Importar la función para conectar a MySQL

// Obtener todos los servicios
exports.getServicios = async (req, res) => {
  const sql = 'SELECT * FROM servicios';
  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql);  // Ejecutar la consulta
    res.json(result);
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los servicios', details: err.message });
  }
};

// Obtener un servicio por ID
exports.getServicioById = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM servicios WHERE idServ = ?';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [id]);  // Ejecutar la consulta
    if (result.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(result[0]);
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el servicio', details: err.message });
  }
};

// Crear un nuevo servicio
exports.createServicio = async (req, res) => {
  const { nombreServ, descripcionServ, duracionServ, precioServ } = req.body;

  // Validación simple
  if (!nombreServ || !duracionServ || !precioServ) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO servicios (nombreServ, descripcionServ, duracionServ, precioServ) VALUES (?, ?, ?, ?)';
  
  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [nombreServ, descripcionServ, duracionServ, precioServ]);  // Ejecutar la consulta
    res.json({
      idServ: result.insertId,
      nombreServ,
      descripcionServ,
      duracionServ,
      precioServ
    });
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el servicio', details: err.message });
  }
};

// Actualizar un servicio
exports.updateServicio = async (req, res) => {
  const { id } = req.params;
  const { nombreServ, descripcionServ, duracionServ, precioServ } = req.body;

  const sqlSelect = 'SELECT * FROM servicios WHERE idServ = ?';
  const sqlUpdate = `
    UPDATE servicios 
    SET nombreServ = ?, descripcionServ = ?, duracionServ = ?, precioServ = ? 
    WHERE idServ = ?
  `;

  try {
    const db = await connectDB();  // Conectar a la base de datos

    // Obtener el servicio actual
    const [result] = await db.execute(sqlSelect, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const servicioActual = result[0];

    // Usar los valores actuales si no se proporcionan en la solicitud
    const nuevoNombreServ = nombreServ || servicioActual.nombreServ;
    const nuevaDescripcionServ = descripcionServ || servicioActual.descripcionServ;
    const nuevaDuracionServ = duracionServ || servicioActual.duracionServ;
    const nuevoPrecioServ = precioServ || servicioActual.precioServ;

    // Ejecutar la actualización
    const [updateResult] = await db.execute(sqlUpdate, [
      nuevoNombreServ,
      nuevaDescripcionServ,
      nuevaDuracionServ,
      nuevoPrecioServ,
      id
    ]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Obtener el servicio actualizado
    const [updatedResult] = await db.execute(sqlSelect, [id]);
    res.json({
      message: 'Servicio actualizado exitosamente',
      servicio: updatedResult[0]  // Devolver el servicio actualizado
    });
    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al actualizar el servicio:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Eliminar un servicio
exports.deleteServicio = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM servicios WHERE idServ = ?';

  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado' });
    db.end();  // Cerrar la conexión
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el servicio', details: err.message });
  }
};

