/**
 * Template : Lien de paiement Stripe envoyé au client.
 * @param {object} order - Détails de la commande
 * @param {Array} items - Liste des articles
 * @param {string} paymentUrl - URL de la session Stripe Checkout
 * @param {string} deadline - Date/heure d'expiration (24h)
 * @returns {object} {subject, html}
 */
export function paymentLinkTemplate(order, items, paymentUrl, deadline) {
  // Calcul du total
  const totalCents = items.reduce((acc, item) => acc + (item.price_cents || 0) * item.quantity, 0);
  const totalFormatted = (totalCents / 100).toFixed(2) + ' €';

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding-bottom: 12px; border-bottom: 1px solid #EEEEEE; padding-top: 12px;">
        <strong style="color: #333333; font-size: 15px;">${item.equipment_name}</strong>
      </td>
      <td style="padding-bottom: 12px; border-bottom: 1px solid #EEEEEE; padding-top: 12px; text-align: center; color: #888888; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding-bottom: 12px; border-bottom: 1px solid #EEEEEE; padding-top: 12px; text-align: right; color: #FF007F; font-weight: bold; font-size: 15px;">
        ${((item.price_cents || 0) * item.quantity / 100).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  return {
    subject: `💳 Votre lien de paiement est prêt — Commande #${order.id}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA;">
  <div style="padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);">
      
      <!-- Header Vibrant -->
      <div style="background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,0,127,0.15) 0%, rgba(255,0,127,0) 70%);"></div>
        <div style="position: relative; z-index: 10;">
          <p style="color: #FF007F; margin: 0 0 15px 0; font-size: 12px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">Location de matériel 🪩</p>
          <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px;">Demande Acceptée !</h2>
          <p style="color: #AAAAAA; margin: 15px 0 0 0; font-size: 16px;">Il ne reste plus qu'une étape.</p>
        </div>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 18px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px; text-align: center;">
          Excellente nouvelle <strong style="color: #FF007F;">${order.client_name}</strong>,<br>
          Votre demande de location pour le <strong>${order.start_date}</strong> a été validée.
        </p>

        <!-- Avertissement 24h -->
        <div style="background-color: #FFF2F7; border-left: 4px solid #FF007F; padding: 20px; border-radius: 8px; margin-bottom: 35px;">
          <p style="margin: 0; font-size: 15px; color: #111111; line-height: 1.6;">
            ⏱️ Votre matériel est <strong>temporairement mis de côté</strong>.<br>
            Pour garantir cette réservation, le paiement doit être effectué avant le :<br>
            <strong style="color: #FF007F; font-size: 16px; display: inline-block; margin-top: 5px;">${deadline}</strong>
          </p>
        </div>

        <!-- Récapitulatif -->
        <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888; border-bottom: 2px solid #EEEEEE; padding-bottom: 10px;">Récapitulatif de la commande</h3>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
          ${itemsRows}
          <tr>
            <td colspan="2" style="padding-top: 20px; text-align: right; font-size: 16px; color: #555555;">Total à payer :</td>
            <td style="padding-top: 20px; text-align: right; font-size: 22px; font-weight: 900; color: #111111;">${totalFormatted}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0 20px;">
          <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(90deg, #FF007F, #FF7A59); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(255, 0, 127, 0.3); transition: all 0.3s ease;">
            💳 PAYER EN LIGNE (${totalFormatted})
          </a>
        </div>
        
        <p style="text-align: center; font-size: 13px; color: #888888; margin-bottom: 30px;">
          Paiement sécurisé traité par <strong>Stripe</strong>. Cartes bancaires acceptées.
        </p>

      </div>
      
      <div style="background-color: #111111; padding: 30px; text-align: center;">
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=100&h=30&q=80" alt="Stripe Secure" style="opacity: 0.5; filter: grayscale(100%); margin-bottom: 15px; border-radius: 4px;" />
        <p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">
          Réservation automatique — <strong style="color: #ffffff;">Soirées Ici</strong>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
