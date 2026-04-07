// Importar Mongoose para la conexión a MongoDB
const mongoose = require('mongoose');

/**
 * @desc Función para conectar la aplicación a la base de datos MongoDB.
 * Utiliza la URI de MongoDB definida en las variables de entorno.
 */
const connectDB = async () => {
  try {
    // Intentar conectar a MongoDB usando la URI del entorno
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Imprimir mensaje de éxito si la conexión es exitosa
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
	console.log(`Conexión a MongoDB exitosa......`);
  } catch (error) {
    // Capturar y registrar cualquier error durante la conexión
    console.error(`Error de conexión a MongoDB: ${error.message}`);
	console.log(`Conexión a MongoDB fallida......`);
    // Salir del proceso con un código de error si la conexión falla
    process.exit(1);
  }
};

// Exportar la función de conexión para ser utilizada en server.js
module.exports = connectDB;
