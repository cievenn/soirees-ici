import { Router } from 'express';
import express from 'express';
import stripe, { findOrCreateStripeCustomer, createAndFinalizeInvoice } from '../services/stripeService.js';
import { getDb } from '../db/database.js';
import { sendClientPaymentConfirmation, sendAdminPaymentAlert } from '../services/emailService.js';

const router = Router();

// ============================================================
// POST /api/stripe/webhook
// Attention : Stripe a besoin du raw body pour valider la signature
// ============================================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;
    const sessionId = session.id;

    try {
      const db = getDb();
      
      // Mettre à jour la commande
      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0]; // Nouvelle deadline de modification

      db.prepare(`
        UPDATE orders 
        SET status = 'APPROVED', approved_at = ?, modification_deadline = ?, updated_at = datetime('now')
        WHERE stripe_session_id = ? AND id = ?
      `).run(now, deadline, sessionId, orderId);

      db.prepare(`
        INSERT INTO audit_log (order_id, action, details, ip_address)
        VALUES (?, 'PAYMENT_RECEIVED', 'Paiement Stripe confirmé, réservation définitive.', 'Stripe Webhook')
      `).run(orderId);

      console.log(`✅ Paiement confirmé pour la commande #${orderId}`);

      // Récupérer l'order et les items pour l'email et la facture
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      const items = db.prepare(`
        SELECT oi.*, e.name as equipment_name
        FROM order_items oi
        JOIN equipment e ON e.id = oi.equipment_id
        WHERE oi.order_id = ?
      `).all(orderId);

      // Création et finalisation de la facture Stripe
      let invoicePdfUrl = null;
      if (!order.stripe_invoice_id) {
        try {
          const rentalDays = session.metadata.rental_days || 1;
          const customer = await findOrCreateStripeCustomer(order.client_email, order.client_name);
          const invoice = await createAndFinalizeInvoice(order, items, customer.id, rentalDays);
          invoicePdfUrl = invoice.invoice_pdf;

          db.prepare(`
            UPDATE orders 
            SET stripe_invoice_id = ?
            WHERE id = ?
          `).run(invoice.id, orderId);
          console.log(`🧾 Facture Stripe générée: ${invoice.id}`);
        } catch (invoiceErr) {
          console.error(`❌ Erreur génération facture Stripe pour order #${orderId}:`, invoiceErr.message);
        }
      } else {
        // La facture a déjà été générée lors d'un précédent appel du webhook
        try {
          const invoice = await stripe.invoices.retrieve(order.stripe_invoice_id);
          invoicePdfUrl = invoice.invoice_pdf;
        } catch (invoiceErr) {
          console.error(`❌ Erreur récupération facture Stripe existante pour order #${orderId}:`, invoiceErr.message);
        }
      }

      // Envoyer l'e-mail de confirmation avec le lien vers la facture PDF
      sendClientPaymentConfirmation(order, items, invoicePdfUrl).catch(err => console.error('Email confirmation finale (client):', err.message));
      sendAdminPaymentAlert(order, items).catch(err => console.error('Email alerte paiement (admin):', err.message));

    } catch (err) {
      console.error('Erreur traitement webhook checkout.session.completed:', err);
      // On retourne quand même 200 à Stripe pour éviter qu'il ne re-tente indéfiniment
    }
  }

  res.json({received: true});
});

export default router;
