const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/contacts', adminController.getContacts);
router.get('/appointments', adminController.getAppointments);
router.get('/testimonials', adminController.getTestimonials);

router.put('/contacts/:id', adminController.updateContactStatus);
router.put('/appointments/:id', adminController.updateAppointmentStatus);
router.put('/testimonials/:id', adminController.updateTestimonialStatus);

module.exports = router;
