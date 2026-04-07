# Sistema de Presupuestos Textiles - TG Publieventos

Este proyecto es una solución integral para la gestión de presupuestos de uniformes, incluyendo catálogos de telas, diseños, tipos de corte y una potente herramienta de generación de presupuestos en PDF con cálculos automáticos.

## Estructura del Proyecto

El proyecto está organizado en una estructura monorepo:

- `/frontend`: Aplicación React + Vite + TypeScript + Tailwind CSS.
- `/server`: API RESTful con Node.js + Express + MongoDB (Mongoose).
- `package.json`: Configuración de dependencias y scripts globales.

## Configuración para Despliegue (Render + MongoDB Atlas)

### 1. Base de Datos (MongoDB Atlas)
1. Crea un cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtén tu cadena de conexión (Connection String).
3. Asegúrate de permitir el acceso desde cualquier IP (`0.0.0.0/0`) en la configuración de seguridad de Atlas para que Render pueda conectarse.

### 2. Variables de Entorno
En Render, debes configurar las siguientes variables de entorno:

- `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas.
- `JWT_SECRET`: Una cadena aleatoria y segura para firmar los tokens.
- `NODE_ENV`: `production`
- `FRONTEND_URL`: La URL que Render te asigne (ej. `https://tg-publieventos.onrender.com`). *Nota: Si el servidor sirve el frontend, esta variable se usa para configurar CORS.*

### 3. Comandos de Construcción en Render
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

## Instrucciones para Cargar a GitHub

Si aún no has subido el código a GitHub, sigue estos pasos desde la terminal en la raíz del proyecto:

1. **Inicializar Git:**
   ```bash
   git init
   ```

2. **Añadir archivos:**
   ```bash
   git add .
   ```

3. **Primer Commit:**
   ```bash
   git commit -m "Initial commit: Sistema de Presupuestos Textiles"
   ```

4. **Vincular con GitHub:**
   (Reemplaza la URL con la de tu repositorio vacío en GitHub)
   ```bash
   git remote add origin https://github.com/mmotal79/tg-publieventos.git
   ```

5. **Subir código:**
   ```bash
   git push -u origin main
   ```

## Depuración y Limpieza Realizada

Se han eliminado los archivos relacionados con "Finanzas Personales" (transacciones, ahorros, etc.) ya que no pertenecen al flujo de trabajo de TG Publieventos. Se ha consolidado la lógica de catálogos en componentes TypeScript (`.tsx`) para asegurar la mantenibilidad y evitar redundancias.

---
Desarrollado por el equipo de ingeniería para TG Publieventos.
