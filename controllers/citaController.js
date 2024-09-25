const connectDB = require('../config/db');  // Conexión a MySQL
const Usuario = require('../models/usuarioModel');  // Modelo de MongoDB para los usuarios

// Obtener todas las citas con nombres de cliente, empleado y servicio
exports.getCitas = async (req, res) => {
  const sql = `
    SELECT c.idCita, c.fechaCita, c.estadoCita, 
    s.nombreServ, c.nombrecliente, c.idEmpleado, 
    c.idServicio, c.fechaRegistroCita
    FROM citas c 
    JOIN servicios s ON c.idServicio = s.idServ
  `;
  
  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql);  // Ejecutar la consulta

    const citasConNombres = await Promise.all(result.map(async (cita) => {
      try {
        // Buscar el nombre del empleado desde MongoDB
        const empleado = await Usuario.findOne({ idMySQL: cita.idEmpleado, rol: 'staff' });

        const fecha = cita.fechaCita.toISOString().split('T')[0];
        const hora = cita.fechaCita.toTimeString().split(' ')[0];

        return {
          idCita: cita.idCita,
          fecha,
          hora,
          estadoCita: cita.estadoCita,
          clienteNombre: cita.nombrecliente,  // Tomamos el nombre directamente de MySQL
          empleadoNombre: empleado ? empleado.nombreUsuario : 'Empleado no encontrado',
          servicioNombre: cita.nombreServ,
          fechaRegistroCita: cita.fechaRegistroCita
        };
      } catch (err) {
        console.error("Error obteniendo empleado", err);
        throw err;
      }
    }));

    res.json(citasConNombres);
    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al obtener las citas:', err);  // Detalles del error en la consola
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Obtener una cita por ID con nombre de cliente, empleado y servicio
exports.getCitaById = async (req, res) => {
  const { idCita } = req.params;

  const sql = `
    SELECT c.idCita, c.fechaCita, c.estadoCita, 
    s.nombreServ, c.nombrecliente, c.idEmpleado, 
    c.idServicio, c.fechaRegistroCita
    FROM citas c 
    JOIN servicios s ON c.idServicio = s.idServ
    WHERE c.idCita = ?
  `;
  
  try {
    const db = await connectDB();  // Conectar a la base de datos
    const [result] = await db.execute(sql, [idCita]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const cita = result[0];
    const empleado = await Usuario.findOne({ idMySQL: cita.idEmpleado, rol: 'staff' });

    const fecha = cita.fechaCita.toISOString().split('T')[0];
    const hora = cita.fechaCita.toTimeString().split(' ')[0];

    res.json({
      idCita: cita.idCita,
      fecha,
      hora,
      estadoCita: cita.estadoCita,
      clienteNombre: cita.nombrecliente,  // Tomamos el nombre directamente de MySQL
      empleadoNombre: empleado ? empleado.nombreUsuario : 'Empleado no encontrado',
      servicioNombre: cita.nombreServ,
      fechaRegistroCita: cita.fechaRegistroCita
    });

    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al obtener la cita:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Crear una nueva cita
exports.createCita = async (req, res) => {
  const { nombrecliente, idEmpleado, idServicio, fecha, hora } = req.body;
  const fechaCita = new Date(`${fecha} ${hora}`);  // Unir fecha y hora en un solo objeto de fecha

  try {
    // Verificar si el empleado existe en MongoDB con el rol adecuado
    const empleado = await Usuario.findOne({ idMySQL: idEmpleado, rol: 'staff' });
    if (!empleado) {
      return res.status(400).json({ error: 'El empleado no existe o no tiene el rol adecuado' });
    }

    // Obtener la duración del servicio
    const db = await connectDB();
    const sqlDuracion = 'SELECT duracionServ FROM servicios WHERE idServ = ?';
    const [result] = await db.execute(sqlDuracion, [idServicio]);

    if (result.length === 0) {
      return res.status(400).json({ error: 'Servicio no encontrado' });
    }

    const duracionServicio = result[0].duracionServ;

    // Verificar la disponibilidad del empleado (sin empalmes de citas activas)
    const disponibilidadSQL = `
      SELECT * FROM citas 
      WHERE idEmpleado = ? 
      AND estadoCita != 'cancelada'  -- Ignorar citas canceladas
      AND (
        (fechaCita <= ? AND DATE_ADD(fechaCita, INTERVAL ? MINUTE) > ?) OR
        (fechaCita >= ? AND fechaCita < DATE_ADD(?, INTERVAL ? MINUTE))
      )
    `;
    const [disponibilidad] = await db.execute(disponibilidadSQL, [
      idEmpleado, 
      fechaCita, duracionServicio, fechaCita,  // Verificar empalme por la fecha de inicio
      fechaCita, fechaCita, duracionServicio    // Verificar empalme por la duración del servicio
    ]);

    if (disponibilidad.length > 0) {
      return res.status(400).json({ error: 'El empleado ya tiene una cita agendada en ese horario' });
    }

    // Insertar la nueva cita en MySQL
    const sql = 'INSERT INTO citas (nombrecliente, idEmpleado, idServicio, fechaCita) VALUES (?, ?, ?, ?)';
    const [insertResult] = await db.execute(sql, [nombrecliente, idEmpleado, idServicio, fechaCita]);

    res.status(201).json({ message: 'Cita creada', idCita: insertResult.insertId });
    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al crear la cita:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};


// Actualizar los datos de una cita
exports.updateCita = async (req, res) => {
  const { idCita } = req.params;
  const { nombrecliente, idEmpleado, idServicio, fecha, hora, estadoCita } = req.body;

  try {
    const db = await connectDB();

    // Obtener los datos actuales de la cita
    const sqlSelect = 'SELECT * FROM citas WHERE idCita = ?';
    const [result] = await db.execute(sqlSelect, [idCita]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const citaActual = result[0];

    // Si los valores no se proporcionan en la solicitud, usamos los valores actuales
    const nuevoNombreCliente = nombrecliente || citaActual.nombrecliente;
    const nuevoIdEmpleado = idEmpleado || citaActual.idEmpleado;
    const nuevoIdServicio = idServicio || citaActual.idServicio;

    // Manejo separado de fecha y hora
    let nuevaFechaCita;
    if (fecha && hora) {
      nuevaFechaCita = new Date(`${fecha} ${hora}`);
    } else if (fecha) {
      const horaActual = citaActual.fechaCita.toTimeString().split(' ')[0];  // Obtener hora actual
      nuevaFechaCita = new Date(`${fecha} ${horaActual}`);
    } else if (hora) {
      const fechaActual = citaActual.fechaCita.toISOString().split('T')[0];  // Obtener fecha actual
      nuevaFechaCita = new Date(`${fechaActual} ${hora}`);
    } else {
      nuevaFechaCita = citaActual.fechaCita;
    }

    const nuevoEstadoCita = estadoCita || citaActual.estadoCita;

    // Obtener la duración del servicio actualizado o actual
    const sqlDuracion = 'SELECT duracionServ FROM servicios WHERE idServ = ?';
    const [servicioResult] = await db.execute(sqlDuracion, [nuevoIdServicio]);

    if (servicioResult.length === 0) {
      return res.status(400).json({ error: 'Servicio no encontrado' });
    }

    const duracionServicio = servicioResult[0].duracionServ;

    // Verificar la disponibilidad del empleado (sin empalmes de citas activas)
    const disponibilidadSQL = `
      SELECT * FROM citas 
      WHERE idEmpleado = ? 
      AND estadoCita != 'cancelada'  -- Ignorar citas canceladas
      AND (
        (fechaCita <= ? AND DATE_ADD(fechaCita, INTERVAL ? MINUTE) > ?) OR
        (fechaCita >= ? AND fechaCita < DATE_ADD(?, INTERVAL ? MINUTE))
      )
      AND idCita != ?  -- Excluir la cita actual de la verificación
    `;
    const [disponibilidad] = await db.execute(disponibilidadSQL, [
      nuevoIdEmpleado, 
      nuevaFechaCita, duracionServicio, nuevaFechaCita,  // Verificar empalme por la fecha de inicio
      nuevaFechaCita, nuevaFechaCita, duracionServicio,  // Verificar empalme por la duración del servicio
      idCita  // Excluir la cita actual de la verificación
    ]);

    if (disponibilidad.length > 0) {
      return res.status(400).json({ error: 'El empleado ya tiene una cita agendada en ese horario' });
    }

    // Actualizar la cita en MySQL
    const sqlUpdate = `
      UPDATE citas 
      SET nombrecliente = ?, idEmpleado = ?, idServicio = ?, fechaCita = ?, estadoCita = ?
      WHERE idCita = ?
    `;
    const [updateResult] = await db.execute(sqlUpdate, [nuevoNombreCliente, nuevoIdEmpleado, nuevoIdServicio, nuevaFechaCita, nuevoEstadoCita, idCita]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita actualizada exitosamente' });
    db.end();  // Cerrar la conexión
  } catch (err) {
    console.error('Error al actualizar la cita:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};
