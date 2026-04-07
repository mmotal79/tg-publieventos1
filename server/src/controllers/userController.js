const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Importar bcryptjs para encriptar la nueva contraseña

// @desc    Obtener todos los usuarios (para Admin/Gerente)
// @route   GET /api/users
// @access  Private/Admin/Gerente
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // No enviar contraseñas
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin/Gerente
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario.', error: error.message });
  }
};

// @desc    Actualizar usuario (Admin/Gerente pueden cambiar rol)
// @route   PUT /api/users/:id
// @access  Private/Admin/Gerente
const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Si la contraseña se va a actualizar, encriptarla primero
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (updatedUser) {
      res.json({
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        rol: updatedUser.rol,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
  }
};

// @desc    Eliminar un usuario (Solo Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.rol === 'admin' && req.user._id.toString() !== user._id.toString()) {
        // Permitir que un admin elimine a otro admin, pero no a sí mismo por seguridad (se puede ajustar)
        await user.deleteOne(); // Use deleteOne() o deleteMany() en lugar de remove()
        res.json({ message: 'Usuario eliminado correctamente.' });
      } else if (user.rol !== 'admin') {
        await user.deleteOne();
        res.json({ message: 'Usuario eliminado correctamente.' });
      } else {
        res.status(403).json({ message: 'No puedes eliminar un usuario administrador a menos que seas otro administrador (y no a ti mismo por seguridad).' });
      }
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
};

// @desc    Actualizar el estado (activo/inactivo) de un usuario (Admin/Gerente)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin/Gerente
const updateUserStatus = async (req, res) => {
  try {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ message: 'El campo "activo" debe ser un valor booleano.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { activo }, { new: true }).select('-password');

    if (updatedUser) {
      res.json({
        id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        rol: updatedUser.rol,
        activo: updatedUser.activo
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del usuario.', error: error.message });
  }
};

// @desc    Restablecer la contraseña de un usuario (Admin/Gerente)
// @route   PATCH /api/users/:id/reset-password
// @access  Private/Admin/Gerente
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }
    
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (updatedUser) {
      res.json({ message: 'Contraseña restablecida exitosamente.' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al restablecer la contraseña.', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus, // Exportar la nueva función
  resetUserPassword, // Exportar la nueva función
};
