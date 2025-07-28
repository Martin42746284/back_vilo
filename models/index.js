const { sequelize } = require('../config/database');

// Import models as functions
const User = require('./User')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Contact = require('./Contact')(sequelize);
const Testimonial = require('./Testimonial')(sequelize);

// Define associations here if needed
// Exemple :
// User.hasMany(Appointment, { foreignKey: 'userId' });
// Appointment.belongsTo(User, { foreignKey: 'userId' });

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Appointment,
  Contact,
  Testimonial,
  syncDatabase
};
