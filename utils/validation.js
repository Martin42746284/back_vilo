const { check } = require('express-validator');

exports.userValidation = [
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

exports.contactValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('service', 'Service is required').not().isEmpty(),
  check('message', 'Message is required').not().isEmpty()
];

exports.appointmentValidation = [
  check('clientName', 'Client name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('date', 'Date is required').not().isEmpty(),
  check('time', 'Time is required').not().isEmpty(),
  check('service', 'Service is required').not().isEmpty()
];

exports.testimonialValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('comment', 'Comment is required').not().isEmpty(),
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 })
];