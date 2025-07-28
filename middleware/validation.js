// middleware/validation.js - Middleware de validation pour les contacts
const { body } = require('express-validator');

const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères')
    .notEmpty()
    .withMessage('Le nom est requis'),
  
  body('email')
    .isEmail()
    .withMessage('Veuillez saisir une adresse email valide')
    .normalizeEmail(),
  
  body('service')
    .trim()
    .notEmpty()
    .withMessage('Le service est requis'),
  
  body('message')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Le message doit contenir au moins 10 caractères')
    .notEmpty()
    .withMessage('Le message est requis')
];

const validateContactUpdate = [
  body('status')
    .optional()
    .isIn(['nouveau', 'traité', 'fermé'])
    .withMessage('Le statut doit être: nouveau, traité ou fermé')
];

module.exports = {
  validateContact,
  validateContactUpdate
};