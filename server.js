const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Importar cors
const connectDB = require('./config/mongo');  // Conexión a MongoDB
const servicioRoutes = require('./routes/servicioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');  // Rutas para MongoDB
const sesionRoutes = require('./routes/sesionRoutes');    // Rutas para sesiones
const citaRoutes = require('./routes/citaRoutes');        // Rutas para citas

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();
app.use(express.json());

// Usar CORS en toda la aplicación
app.use(cors({
  origin: 'http://localhost:8080',  // Permitir solicitudes desde el frontend
  credentials: true
}));

// Rutas para Servicios (MySQL)
app.use('/servicios', servicioRoutes);

// Rutas para Productos (MySQL)
app.use('/productos', productoRoutes);

// Rutas para Usuarios (MongoDB)
app.use('/usuarios', usuarioRoutes);

// Rutas para Sesiones (MongoDB)
app.use('/sesiones', sesionRoutes);

// Rutas para Citas (MySQL + MongoDB)
app.use('/citas', citaRoutes);

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor API corriendo en el puerto ${port}`);
});
