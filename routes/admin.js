const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/contacts', adminController.getContacts);
router.get('/appointments', adminController.getAppointments);

router.put('/contacts/:id', adminController.updateContactStatus);
router.put('/appointments/:id', adminController.updateAppointmentStatus);

module.exports = router;
