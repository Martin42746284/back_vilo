const { Testimonial } = require('../models');
const { validationResult, body } = require('express-validator');

// ✅ Middleware de validation pour création de témoignage
exports.validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('post')
    .notEmpty().withMessage('Le poste est requis'),

  body('entreprise')
    .notEmpty().withMessage('Le nom de l’entreprise est requis'),

  body('comment')
    .notEmpty().withMessage('Le commentaire est requis')
    .isLength({ max: 1000 }).withMessage('Le commentaire ne doit pas dépasser 1000 caractères'),

  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5')
];

// ✅ GET - Récupérer tous les témoignages
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ✅ GET /admin - Récupérer tous les témoignages (admin seulement)
exports.getAdminTestimonials = async (req, res) => {
  try {
    // Vérification admin (à adapter à votre système)
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès réservé aux administrateurs' 
      });
    }

    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'post', 'entreprise', 'comment', 'rating', 'status', 'createdAt', 'updatedAt']
    });

    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (err) {
    console.error('Erreur getAdminTestimonials:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ POST - Créer un nouveau témoignage
exports.createTestimonial = async (req, res) => {
  console.log('Contenu de req.body:', req.body);

  const { name, post, entreprise, comment, rating } = req.body;

  if (!name || !post || !entreprise || !comment || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont obligatoires.',
      data: { name, post, entreprise, comment, rating }
    });
  }

  try {
    const testimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      comment,
      rating,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'Témoignage soumis avec succès.'
    });
  } catch (error) {
    console.error('Erreur création témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};


// ✅ DELETE - Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
