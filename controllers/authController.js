// authController.js 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Gestionnaire d'erreurs
const handleErrors = (res, error, status = 500, message = 'Server error') => {
  console.error(error.message || error);
  return res.status(status).json({ success: false, message });
};

// Génération du token JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// REGISTER
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // sera hashé automatiquement par le hook beforeSave
      phone,
      role: 'user',
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token
    });
  } catch (error) {
    handleErrors(res, error);
  }
};

// LOGIN - Version améliorée avec plus de debugging
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    
    // Debugging: Log des données reçues
    console.log('Tentative de connexion pour:', email);
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('Utilisateur trouvé:', user.email, 'Rôle:', user.role);
    
    // Vérification du mot de passe
    const isPasswordValid = await user.comparePassword(password);
    console.log('Mot de passe valide:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    handleErrors(res, error);
  }
};

// PROTECT (middleware d'auth)
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    handleErrors(res, error, 401, 'Not authorized, token failed');
  }
};

// ME (profil utilisateur actuel)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    handleErrors(res, error);
  }
};