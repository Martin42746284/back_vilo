const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    client_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('en_attente', 'confirmé', 'annulé', 'terminé'),
      defaultValue: 'en_attente'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // si tu veux permettre les rendez-vous anonymes
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'appointments',
    timestamps: true
  });

  return Appointment;
};
