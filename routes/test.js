const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db'); // ou chemin relatif correct

router.get('/test-db', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT NOW()');
    res.status(200).json({ connected: true, time: result[0] });
  } catch (error) {
    console.error('Erreur de connexion DB:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

module.exports = router;
