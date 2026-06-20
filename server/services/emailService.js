import { Resend } from 'resend';
import { clientConfirmationTemplate } from '../templates/clientConfirmation.js';
import { adminValidationTemplate } from '../templates/adminValidation.js';
import { adminReturnAlertTemplate } from '../templates/adminReturnAlert.js';
import { clientThankYouTemplate } from '../templates/clientThankYou.js';
import { paymentLinkTemplate } from '../templates/paymentLink.js';
import { clientPaymentConfirmationTemplate } from '../templates/clientPaymentConfirmation.js';
import { adminPaymentAlertTemplate } from '../templates/adminPaymentAlert.js';

let resend;

/**
 * Initialise le client Resend.
 */
export function initEmailService() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY manquant, les emails ne seront pas envoyés.');
    return;
  }
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('📧 Service email (Resend) initialisé');
}

/**
 * Envoie un email via Resend.
 * @param {string|string[]} to - Destinataire(s)
 * @param {string} subject - Sujet
 * @param {string} html - Corps HTML
 * @param {Array} attachments - Pièces jointes (optionnel)
 */
async function sendEmail(to, subject, html, attachments = []) {
  if (!resend) {
    console.warn('⚠️ Service email non initialisé, email non envoyé:', subject);
    return;
  }

  try {
    const payload = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };
    if (attachments.length > 0) {
      payload.attachments = attachments;
    }
    const data = await resend.emails.send(payload);
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log(`📧 Email envoyé: ${subject} → ${to} (${data.data?.id})`);
    return data;
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
 * Envoie l'email de confirmation au client suite au paiement Stripe, incluant la facture.
 */
export async function sendClientPaymentConfirmation(order, items, invoicePdfUrl) {
  const { subject, html } = clientPaymentConfirmationTemplate(order, items, invoicePdfUrl);
  
  let attachments = [];
  if (invoicePdfUrl) {
    try {
      const response = await fetch(invoicePdfUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        attachments.push({
          filename: `Facture_Soirees_Ici_${order.id}.pdf`,
          content: buffer
        });
      } else {
        console.warn(`⚠️ Impossible de télécharger le PDF de la facture (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('❌ Erreur lors du téléchargement du PDF de la facture :', err.message);
    }
  }

  return sendEmail(order.client_email, subject, html, attachments);
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
