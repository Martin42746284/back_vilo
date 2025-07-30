const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { body, validationResult } = require('express-validator');


// Middleware de validation
const validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),

  body('post')
    .notEmpty().withMessage('Le poste est requis.')
    .isLength({ min: 2, max: 100 }).withMessage('Le poste doit contenir entre 2 et 100 caractères.'),

  body('entreprise')
    .notEmpty().withMessage("Le nom de l'entreprise est requis.")
    .isLength({ min: 2, max: 100 }).withMessage("Le nom de l'entreprise doit contenir entre 2 et 100 caractères."),

  body('comment')
    .notEmpty().withMessage('Le commentaire est requis.')
    .isLength({ min: 10 }).withMessage('Le commentaire doit contenir au moins 10 caractères.'),

  body('rating')
    .notEmpty().withMessage('La note est requise.')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être un nombre entre 1 et 5.')
];

// Route POST 
router.post('/', validateTestimonial, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Échec de validation.',
      errors: errors.array()
    });
  }

  try {
    const { name, post, entreprise, comment, rating } = req.body;

    const newTestimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      comment,
      rating,
      status: 'pending' // En attente de modération
    });

    res.status(201).json({
      success: true,
      data: newTestimonial,
      message: 'Témoignage soumis avec succès. Il sera publié après modération.'
    });

  } catch (error) {
    console.error('Erreur création témoignage:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation côté base de données.',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du témoignage.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials/pending - Récupère uniquement les témoignages en attente
router.get('/pending', async (req, res) => {
  try {
    // Récupération uniquement des témoignages avec status = 'pending'
    const testimonials = await Testimonial.findAll({
      where: { status: 'pending' }, // Filtre fixe
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'post', 'entreprise', 'comment', 'rating', 'status', 'createdAt']
    });

    res.json({ 
      success: true, 
      data: testimonials,
      count: testimonials.length,
      message: 'Témoignages en attente récupérés avec succès',
      statusFilter: 'pending' // Information constante
    });

  } catch (error) {
    console.error('Erreur récupération témoignages en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des témoignages en attente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials/admin - Récupérer TOUS les témoignages (admin seulement)
router.get('/admin', async (req, res) => {
  try {
    console.log('User object:', req.user); // Vérifiez ce qui est reçu
    console.log('Is admin?', req.user?.isAdmin);
    // Vérification des permissions (à adapter selon votre système d'authentification)
    if (!req.user?.isAdmin) {
      console.log('Échec autorisation - User:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux administrateurs'
      });
    }

    // Récupération avec possibilité de filtrer par status (optionnel)
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      const validStatuses = ['approved', 'pending', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide. Valeurs autorisées : approved, pending, rejected'
        });
      }
      whereClause.status = status;
    }

    const testimonials = await Testimonial.findAll({
      where: whereClause, // vide si aucun filtre
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'post', 'entreprise', 'comment', 'rating', 'status', 'createdAt', 'updatedAt']
    });

    res.json({ 
      success: true, 
      data: testimonials,
      count: testimonials.length,
      filteredBy: status || 'all' // Information utile pour le frontend
    });
    
  } catch (error) {
    console.error('Erreur récupération témoignages (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials?status=approved|pending|rejected
router.get('/', async (req, res) => {
  try {
    const { status = 'approved' } = req.query;
    
    // Validation du paramètre status
    const validStatuses = ['approved', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs autorisées : approved, pending, rejected'
      });
    }

    const testimonials = await Testimonial.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'post', 'entreprise', 'comment', 'rating', 'status', 'createdAt'] // Ajout de status
    });

    res.json({ 
      success: true, 
      data: testimonials,
      count: testimonials.length,
      statusFilter: status // Information utile pour le frontend
    });

  } catch (error) {
    console.error('Erreur récupération témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials/:id - Récupérer un témoignage spécifique
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id, {
      attributes: ['id', 'name', 'post', 'entreprise', 'comment', 'rating', 'status', 'createdAt']
    });

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Témoignage non trouvé' 
      });
    }

    // Vérification des permissions
    const canAccess = testimonial.status === 'approved' || req.user?.isAdmin;
    if (!canAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé à ce témoignage' 
      });
    }

    res.json({ 
      success: true, 
      data: testimonial,
      isAdminView: !!req.user?.isAdmin // Information utile pour le frontend
    });

  } catch (error) {
    console.error('Erreur récupération témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/testimonials/:id - Mettre à jour un témoignage
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    const { name, post, entreprise, comment, rating, status } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (post) updates.post = post;
    if (entreprise) updates.entreprise = entreprise;
    if (comment) updates.comment = comment;
    if (rating) updates.rating = rating;
    if (status) updates.status = status;

    await testimonial.update(updates);

    res.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour témoignage:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
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

// DELETE /api/testimonials/:id - Supprimer un témoignage
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce témoignage car il est lié à d\'autres données'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;