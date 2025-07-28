const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false, // true pour le port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Désactive la vérification SSL en dev
  }
});

// Testez la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Ready');
  }
});


const sendConfirmationEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Vilo Assist Pro" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message, err.stack);
    throw err;
  }
};

module.exports = { sendConfirmationEmail };
