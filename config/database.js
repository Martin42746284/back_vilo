const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // obligatoire pour Neon
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };

// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'mysql',
//   logging: process.env.NODE_ENV === 'development' ? console.log : false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
//   define: {
//     timestamps: true,
//     underscored: false,
//     freezeTableName: true,
//   },
// });

// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Connexion MySQL établie avec succès.');
//   } catch (error) {
//     console.error('❌ Échec de connexion à MySQL :', error.message);
//     process.exit(1);
//   }
// };

// module.exports = { sequelize, testConnection };

