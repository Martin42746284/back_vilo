// controllers/contactController.js
const { Contact } = require('../models'); // Ajustez le chemin selon votre structure
const { validationResult } = require('express-validator');

const contactController = {
  // Créer un nouveau contact
  create: async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { name, email, service, message } = req.body;

      // Créer le contact
      const contact = await Contact.create({
        name,
        email,
        service,
        message,
        status: 'nouveau'
      });

      res.status(201).json({
        success: true,
        message: 'Contact créé avec succès',
        data: contact
      });

    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      
      // Gérer les erreurs de validation Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // Récupérer tous les contacts
  getAll: async (req, res) => {
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
        order: [['createdAt', 'DESC']]
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
      console.error('Erreur lors de la récupération des contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // Récupérer un contact par ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await Contact.findByPk(id);

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
      console.error('Erreur lors de la récupération du contact:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // Mettre à jour le statut d'un contact
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Vérifier que le statut est valide
      const validStatuses = ['nouveau', 'traité', 'fermé'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      const contact = await Contact.findByPk(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact non trouvé'
        });
      }

      contact.status = status;
      await contact.save();

      res.json({
        success: true,
        message: 'Statut mis à jour avec succès',
        data: contact
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du contact:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // Supprimer un contact
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const contact = await Contact.findByPk(id);

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
      console.error('Erreur lors de la suppression du contact:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
};

module.exports = contactController;