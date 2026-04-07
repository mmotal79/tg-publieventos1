// Autor: Ing. Miguel Mota
// Fecha de Creación: 27/08/2025 20:12
// Nombre del Archivo: server.js (Control de cambio y secuencia N° 016: Inclusión de rutas para Configuración Global)

const express = require('express');
const path = require('path');
const { createServer: createViteServer } = require('vite');
const dotenv = require('dotenv').config(); // Cargar variables de entorno
const connectDB = require('../config/db'); // Ruta corregida para db.js
const cors = require('cors'); // Importar cors

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const presupuestoRoutes = require('./routes/presupuestoRoutes');
const materialRoutes = require('./routes/materialRoutes');
const acabadoRoutes = require('./routes/acabadoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const configGlobalRoutes = require('./routes/configGlobalRoutes');

async function startServer() {
  // Conectar a la base de datos
  connectDB();

  const app = express();
  const PORT = process.env.PORT || 3000; // Usar 3000 para el entorno de AI Studio

  // Middleware para parsear JSON y urlencoded
  app.use(express.json()); // Para aceptar datos JSON en el body
  app.use(express.urlencoded({ extended: false })); // Para aceptar datos de formularios urlencoded

  // Middleware CORS para permitir solicitudes desde el frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Definir rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clientes', clienteRoutes);
  app.use('/api/presupuestos', presupuestoRoutes);
  app.use('/api/catalogos/materiales', materialRoutes);
  app.use('/api/catalogos/acabados', acabadoRoutes);
  app.use('/api/catalogos', catalogoRoutes);
  app.use('/api/catalogos/config-global', configGlobalRoutes);

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  });
}

startServer();
