// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo');  // Conexión a MongoDB
const servicioRoutes = require('./routes/servicioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');  // Rutas para MongoDB
const sesionRoutes = require('./routes/sesionRoutes');    // Rutas para sesiones

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();
app.use(express.json());

// Rutas para Servicios (MySQL)
app.use('/servicios', servicioRoutes);

// Rutas para Productos (MySQL)
app.use('/productos', productoRoutes);

// Rutas para Usuarios (MongoDB)
app.use('/usuarios', usuarioRoutes);

// Rutas para Sesiones (MongoDB)
app.use('/sesiones', sesionRoutes);  // Asegúrate de agregar esto

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
