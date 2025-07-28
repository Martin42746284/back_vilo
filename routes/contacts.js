// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { Contact } = require('../models');
const { validationResult } = require('express-validator');

// POST /api/contacts - Créer un nouveau contact
router.post('/', async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { name, email, service, message } = req.body;

    // Validation manuelle des champs obligatoires
    if (!name || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, email, service et message sont obligatoires.'
      });
    }

    // Création du contact
    const newContact = await Contact.create({
      name,
      email,
      service,
      message,
      status: 'nouveau'  // Correspond à votre ENUM
    });

    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact créé avec succès.'
    });

  } catch (error) {
    console.error('Erreur création contact:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du contact.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/contacts - Récupérer tous les contacts avec pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'service', 'message', 'status', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/contacts/:id - Récupérer un contact spécifique
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'service', 'message', 'status', 'createdAt', 'updatedAt']
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    res.json({ 
      success: true, 
      data: contact 
    });

  } catch (error) {
    console.error('Erreur récupération contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/contacts/:id - Mettre à jour un contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    // Ne permet que la mise à jour des champs autorisés
    const { status } = req.body;
    
    // Vérifier que le statut est valide
    const validStatuses = ['nouveau', 'traité', 'fermé'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Les valeurs autorisées sont: nouveau, traité, fermé'
      });
    }

    const allowedUpdates = { status };

    await contact.update(allowedUpdates);

    res.json({
      success: true,
      data: contact,
      message: 'Contact mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour contact:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/contacts/:id - Supprimer un contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;