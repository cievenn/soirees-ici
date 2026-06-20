import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Génère une session Stripe Checkout pour une commande.
 * Inclut les lignes de location (prix × quantité × durée) et la caution si applicable.
 * 
 * @param {object} order - La commande (avec total_rental_cents, total_deposit_cents)
 * @param {Array} items - Les items (avec price_cents, caution_cents, quantity)
 * @param {number} rentalDays - Nombre de jours de location
 * @returns {Promise<object>} { url, sessionId }
 */
export async function createCheckoutSession(order, items, rentalDays) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: `${item.equipment_name} (${rentalDays} jour${rentalDays > 1 ? 's' : ''})`,
        description: `Location × ${item.quantity} unité${item.quantity > 1 ? 's' : ''} × ${rentalDays} jour${rentalDays > 1 ? 's' : ''}`,
      },
      // Prix unitaire = price_cents × nombre de jours (Stripe multiplie par quantity)
      unit_amount: (item.unit_price_cents || item.price_cents || 0) * rentalDays,
    },
    quantity: item.quantity,
  }));

  // Ajouter la caution comme ligne séparée si applicable
  if (order.total_deposit_cents > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Caution (remboursable au retour)',
          description: 'Montant total de la caution — remboursé intégralement après retour du matériel en bon état.',
        },
        unit_amount: order.total_deposit_cents,
      },
      quantity: 1,
    });
  }

  // On peut forcer l'expiration de la session à 24h (min 30 min, max 24h)
  const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    customer_email: order.client_email,
    client_reference_id: order.id.toString(),
    expires_at: expiresAt,
    metadata: {
      order_id: order.id,
      rental_days: rentalDays,
      total_rental_cents: order.total_rental_cents,
      total_deposit_cents: order.total_deposit_cents,
    },
    success_url: `${process.env.FRONTEND_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/`,
  });

  return {
    url: session.url,
    sessionId: session.id
  };
}

/**
 * Trouve ou crée un Customer Stripe basé sur l'email.
 * @param {string} email 
 * @param {string} name 
 * @returns {Promise<object>} Le Customer Stripe
 */
export async function findOrCreateStripeCustomer(email, name) {
  const customers = await stripe.customers.list({
    email: email,
    limit: 1
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  return await stripe.customers.create({
    email: email,
    name: name
  });
}

/**
 * Crée et finalise une Invoice Stripe, et la marque comme payée.
 * Retourne l'Invoice avec l'URL du PDF.
 * @param {object} order 
 * @param {Array} items 
 * @param {string} customerId 
 * @param {number} rentalDays 
 * @returns {Promise<object>} L'Invoice Stripe finalisée
 */
export async function createAndFinalizeInvoice(order, items, customerId, rentalDays) {
  // 1. Créer l'Invoice vide pour le Customer
  const invoice = await stripe.invoices.create({
    customer: customerId,
    description: `Commande #${order.id} - Soirées Ici`,
    collection_method: 'send_invoice', // Important pour ne pas charger automatiquement une carte enregistrée
    days_until_due: 0,
    metadata: {
      order_id: order.id,
    }
  });

  // 2. Ajouter les Invoice Items
  for (const item of items) {
    const unitAmount = (item.unit_price_cents || item.price_cents || 0) * rentalDays;
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      currency: 'eur',
      description: `${item.equipment_name} (Location × ${item.quantity} unité${item.quantity > 1 ? 's' : ''} × ${rentalDays} jour${rentalDays > 1 ? 's' : ''})`,
      unit_amount_decimal: String(unitAmount),
      quantity: item.quantity,
    });
  }

  if (order.total_deposit_cents > 0) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      currency: 'eur',
      description: 'Caution (remboursable au retour)',
      unit_amount_decimal: String(order.total_deposit_cents),
      quantity: 1,
    });
  }

  // 3. Finaliser l'Invoice (change le statut de 'draft' à 'open')
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  // 4. Marquer l'Invoice comme payée (puisque le paiement a été fait via Checkout)
  const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
    paid_out_of_band: true, // Indique que le paiement a été fait "out of band" (ici via la session Checkout)
  });

  return paidInvoice;
}

export default stripe;
