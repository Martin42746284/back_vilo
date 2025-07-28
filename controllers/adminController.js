const { Contact, Appointment } = require('../models');

// GET /admin/contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement des contacts" });
  }
};

// GET /admin/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ order: [['createdAt', 'DESC']] });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement des rendez-vous" });
  }
};

// PUT /admin/contacts/:id
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });

    contact.status = status;
    await contact.save();

    res.json({ success: true, message: "Statut mis à jour", contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur mise à jour contact" });
  }
};

// PUT /admin/appointments/:id
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, message: "Statut mis à jour", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur mise à jour rendez-vous" });
  }
};
