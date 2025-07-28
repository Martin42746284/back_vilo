/ routes/users.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../controllers/authController');
const { User } = require('../models');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = 'uploads/avatars/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// POST /api/users/avatar - Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier téléchargé' 
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Supprimer l'ancien avatar s'il existe
    const user = await User.findByPk(req.user.id);
    if (user.avatar && user.avatar !== avatarUrl) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Mettre à jour l'utilisateur dans la base de données
    await User.update(
      { avatar: avatarUrl },
      { where: { id: req.user.id } }
    );

    res.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.message.includes('images')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors du téléchargement' 
    });
  }
});

// DELETE /api/users/avatar - Supprimer avatar
router.delete('/avatar', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }

      await User.update(
        { avatar: null },
        { where: { id: req.user.id } }
      );
    }

    res.json({ 
      success: true, 
      message: 'Avatar supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression' 
    });
  }
});

// GET /api/users/profile - Obtenir le profil utilisateur
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;