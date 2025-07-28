const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le nom est requis'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Email invalide'
        },
        notEmpty: {
          msg: 'L\'email est requis'
        }
      }
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le service est requis'
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le message est requis'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('nouveau', 'traité', 'fermé'),
      defaultValue: 'nouveau'
    }
  }, {
    tableName: 'contacts',
    timestamps: true
  });

  return Contact;
};
