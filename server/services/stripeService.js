import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Génère une session Stripe Checkout pour une commande.
 * @param {object} order - La commande
 * @param {Array} items - Les items (avec price_cents)
 * @returns {Promise<object>} { url, sessionId }
 */
export async function createCheckoutSession(order, items) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.equipment_name,
      },
      unit_amount: item.price_cents || 0,
    },
    quantity: item.quantity,
  }));

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
      order_id: order.id
    },
    success_url: `${process.env.FRONTEND_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/`,
  });

  return {
    url: session.url,
    sessionId: session.id
  };
}

export default stripe;
