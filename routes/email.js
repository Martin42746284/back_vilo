const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/admin/send-email
router.post('/send-email', async (req, res) => {
  const { to, name, type, data } = req.body;

  console.log('[SMTP CONFIG]', {
    host: process.env.MAIL_HOST || 'NON CONFIGURÉ',
    user: process.env.MAIL_USER || 'NON CONFIGURÉ',
    port: process.env.MAIL_PORT || 'NON CONFIGURÉ'
  });

  // Validation améliorée
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SMTP CONFIG]', {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      from: process.env.MAIL_FROM,
      secure: process.env.MAIL_SECURE
    });
  }

  console.log('[EMAIL REQUEST] Destinataire:', to, '| Type:', type);

  // Configuration SMTP avec vérification
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error('[EMAIL CONFIG] Variables SMTP manquantes');
    return res.status(500).json({ 
      success: false, 
      message: 'Configuration serveur incomplète' 
    });
  }

  try {
    // Création du transporteur avec timeout
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true', // false pour STARTTLS
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        tls: {
            // Ne pas rejeter les certificats auto-signés (utile en dev)
            rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
    });

    // Vérification de la connexion SMTP
    await transporter.verify((error) => {
      if (error) {
        console.error('[SMTP VERIFY]', error);
        throw new Error('Échec de connexion au serveur SMTP');
      }
      console.log('[SMTP READY] Serveur SMTP configuré');
    });

    // Construction du contenu
    const emailContent = buildEmailContent(type, name, data);
    
    // Envoi de l'email
    const info = await transporter.sendMail({
      from: `"Vilo Assist Pro" <${process.env.MAIL_FROM || 'no-reply@viloassist.com'}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text || emailContent.subject // Fallback text
    });

    console.log('[EMAIL SENT] Message ID:', info.messageId);
    return res.status(200).json({ 
      success: true, 
      message: 'Email envoyé avec succès.',
      messageId: info.messageId 
    });

  } catch (err) {
    console.error('[EMAIL ERROR]', {
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      type,
      recipient: to
    });
    
    return res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? `Erreur technique: ${err.message}`
        : "Erreur lors de l'envoi de l'email",
      technicalError: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Dans votre fichier de routes (backend)
router.get('/test-smtp', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.verify(); // Teste la connexion SMTP
    res.json({ success: true, message: 'SMTP configuré avec succès !' });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Échec de connexion SMTP',
      error: err.message
    });
  }
});

// Helper pour générer le contenu :personalisable
function buildEmailContent(type, name, data) {
  let content = {
    subject: '',
    html: '',
    text: ''
  };

  switch(type) {
    case 'appointment-confirmation':
      content.subject = `Confirmation de votre rendez-vous - Vilo Assist`;
      content.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Confirmation de rendez-vous</h2>
          <p>Bonjour ${name},</p>
          <p>Votre rendez-vous a été confirmé.</p>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Date :</strong> ${data?.date || 'non spécifiée'}</p>
            <p style="margin: 8px 0 0 0;"><strong>Heure :</strong> ${data?.time || 'non spécifiée'}</p>
          </div>

          <p>Merci de votre confiance.</p>
          <p style="margin-top: 24px;">L'équipe Vilo Assist</p>
        </div>
      `;
      break;

    case 'appointment-cancellation':
      content.subject = `Annulation de votre rendez-vous - Vilo Assist`;
      content.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Annulation de rendez-vous</h2>
          <p>Bonjour ${name},</p>
          <p>Nous vous informons que votre rendez-vous prévu le ${data?.date || 'date non spécifiée'} à ${data?.time || 'heure non spécifiée'} a été annulé.</p>
          
          <p style="color: #dc2626;">Nous sommes désolés pour ce contretemps.</p>
          
          <p>Vous pouvez prendre un nouveau rendez-vous en cliquant sur le lien suivant :</p>
          <a href="https://vilo-assist-pro-jet.vercel.app/" style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin: 8px 0;">Prendre un nouveau rendez-vous</a>
          
          <p style="margin-top: 24px;">L'équipe Vilo Assist</p>
        </div>
      `;
      break;

    case 'contact':
      content.subject = `Réponse à votre demande de contact - Vilo Assist`;
      content.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Confirmation de réception</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre message concernant le service <strong>${data?.service || 'non spécifié'}</strong> :</p>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-style: italic;">"${data?.message || ''}"</p>
          </div>
          
          <p>Nous traitons votre demande et vous répondrons dans les plus brefs délais.</p>
          <p style="margin-top: 24px;">L'équipe Vilo Assist</p>
        </div>
      `;
      break;

    default:
      content.subject = `Notification - Vilo Assist`;
      content.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Bonjour ${name},</p>
          <p>Vous recevez ce message car une action a été effectuée sur votre compte.</p>
          <p style="margin-top: 24px;">L'équipe Vilo Assist</p>
        </div>
      `;
  }

  // Version texte pour les clients email simples
  content.text = content.html
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .replace(/\s{2,}/g, '\n') // Nettoie les espaces multiples
    .trim();

  return content;
}

// Test SMTP (à ajouter AVANT module.exports)
router.post('/test-smtp', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Test 1: Vérifie la connexion SMTP
    await transporter.verify();
    
    // Test 2: Envoi réel d'un email test
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: 'test@example.com',
      subject: 'Test SMTP',
      text: 'Ceci est un email de test'
    });

    res.json({
      success: true,
      message: 'Connexion SMTP réussie et email test envoyé',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Échec de connexion SMTP',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;