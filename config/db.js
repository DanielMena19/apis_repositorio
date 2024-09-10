// config/db.js
const mysql = require('mysql2/promise');  // Usar la versión con promesas para mejor manejo de async/await
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Crear una función de conexión
const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Conectado a la base de datos MySQL');
    return connection; // Devolver la conexión para usarla en otros módulos
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    throw err;  // Lanza el error para que lo manejes en otro lugar si es necesario
  }
};

module.exports = connectDB;
