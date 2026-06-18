import nodemailer from 'nodemailer';
import { clientConfirmationTemplate } from '../templates/clientConfirmation.js';
import { adminValidationTemplate } from '../templates/adminValidation.js';
import { adminReturnAlertTemplate } from '../templates/adminReturnAlert.js';
import { clientThankYouTemplate } from '../templates/clientThankYou.js';
import { paymentLinkTemplate } from '../templates/paymentLink.js';
import { clientPaymentConfirmationTemplate } from '../templates/clientPaymentConfirmation.js';
import { adminPaymentAlertTemplate } from '../templates/adminPaymentAlert.js';

let transporter;

/**
 * Initialise le transporteur Nodemailer.
 */
export function initEmailService() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Vérification de la connexion SMTP
  transporter.verify()
    .then(() => console.log('📧 Service email connecté avec succès'))
    .catch(err => console.warn('⚠️ Connexion SMTP échouée (les emails ne seront pas envoyés):', err.message));
}

/**
 * Envoie un email.
 * @param {string|string[]} to - Destinataire(s)
 * @param {string} subject - Sujet
 * @param {string} html - Corps HTML
 */
async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.warn('⚠️ Service email non initialisé, email non envoyé:', subject);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Soirées Ici" <noreply@soirees-ici.be>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    console.log(`📧 Email envoyé: ${subject} → ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ Erreur envoi email "${subject}":`, error.message);
    throw error;
  }
}

/**
 * Envoie l'email de confirmation au client après création de commande.
 */
export async function sendClientConfirmation(order, items) {
  const { subject, html } = clientConfirmationTemplate(order, items);
  return sendEmail(order.client_email, subject, html);
}

/**
 * Envoie l'email avec lien de validation aux administrateurs.
 */
export async function sendAdminValidation(order, items) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (adminEmails.length === 0) {
    console.warn('⚠️ Aucune adresse admin configurée (ADMIN_EMAILS)');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const validationUrl = `${frontendUrl}/valider-commande?id=${order.id}&token=${order.token_secret}`;

  const { subject, html } = adminValidationTemplate(order, items, validationUrl);
  return sendEmail(adminEmails, subject, html);
}

/**
 * Envoie l'alerte de retour non confirmé aux administrateurs.
 */
export async function sendAdminReturnAlert(order, items) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (adminEmails.length === 0) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const validationUrl = `${frontendUrl}/valider-commande?id=${order.id}&token=${order.token_secret}`;

  const { subject, html } = adminReturnAlertTemplate(order, items, validationUrl);
  return sendEmail(adminEmails, subject, html);
}

/**
 * Envoie l'email de remerciement au client après retour confirmé.
 */
export async function sendClientThankYou(order) {
  const { subject, html } = clientThankYouTemplate(order);
  return sendEmail(order.client_email, subject, html);
}

/**
 * Envoie l'email contenant le lien de paiement Stripe.
 */
export async function sendPaymentLink(order, items, paymentUrl, deadlineStr) {
  const { subject, html } = paymentLinkTemplate(order, items, paymentUrl, deadlineStr);
  return sendEmail(order.client_email, subject, html);
}

/**
 * Envoie l'email de confirmation au client suite au paiement Stripe.
 */
export async function sendClientPaymentConfirmation(order, items) {
  const { subject, html } = clientPaymentConfirmationTemplate(order, items);
  return sendEmail(order.client_email, subject, html);
}

/**
 * Envoie l'email d'alerte à l'administrateur suite au paiement d'un client.
 */
export async function sendAdminPaymentAlert(order, items) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (adminEmails.length === 0) {
    console.warn("⚠️ Aucune adresse admin configurée (ADMIN_EMAILS) pour l'alerte paiement");
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const adminUrl = `${frontendUrl}/valider-commande?id=${order.id}&token=${order.token_secret}`;

  const { subject, html } = adminPaymentAlertTemplate(order, items, adminUrl);
  return sendEmail(adminEmails, subject, html);
}
