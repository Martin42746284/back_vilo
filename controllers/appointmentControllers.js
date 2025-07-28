const Testimonial = require('../models/Testimonial');
const { validationResult } = require('express-validator');

exports.getTestimonials = async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;

    const testimonials = await Testimonial.findAll({ 
      where: whereClause,
      order: [['createdAt', 'DESC']] 
    });
    
    res.json({ success: true, data: testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ 
      where: { status: 'approved' },
      order: [['createdAt', 'DESC']] 
    });
    
    res.json({ success: true, data: testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTestimonial = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, post, entreprise, rating, comment } = req.body;
    
    const testimonial = await Testimonial.create({ 
      name, 
      post, 
      entreprise, 
      rating, 
      comment,
      userId: req.user?.id // Optionnel: si système d'authentification
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Merci pour votre témoignage ! Il sera publié après modération.',
      data: testimonial 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    testimonial.status = status;
    await testimonial.save();
    
    res.json({ 
      success: true, 
      message: `Témoignage ${status === 'approved' ? 'approuvé' : 'rejeté'}`,
      data: testimonial 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};