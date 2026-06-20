/**
 * Template : Confirmation finale (Client) suite au paiement.
 * @param {object} order - Détails de la commande
 * @param {Array} items - Liste des articles
 * @returns {object} {subject, html}
 */
export function clientPaymentConfirmationTemplate(order, items, invoicePdfUrl) {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding-bottom: 8px;"><strong>${item.equipment_name}</strong></td>
      <td style="padding-bottom: 8px; color: #10B981; font-weight: bold; text-align: right;">x${item.quantity}</td>
    </tr>
  `).join('');

  const totalPaid = ((order.total_rental_cents + order.total_deposit_cents) / 100).toFixed(2);

  const invoiceButtonHtml = invoicePdfUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoicePdfUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">📄 Télécharger votre facture</a>
        </div>
  ` : '';

  return {
    subject: `✅ Paiement confirmé & Réservation validée — Soirées Ici (#${order.id})`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0;">
  <div style="background-color: #ECFDF5; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(16, 185, 129, 0.15);">
      
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 50px 20px; text-align: center;">
        <p style="color: #D1FAE5; margin: 0 0 10px 0; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Réservation Officielle 🏆</p>
        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-family: 'Georgia', serif; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">Paiement Confirmé !</h2>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px; text-align: center;">
          Félicitations <strong style="color: #10B981; font-size: 18px;">${order.client_name}</strong>,<br>
          Nous avons bien reçu votre paiement de <strong>${totalPaid}€</strong>. Votre réservation pour le <strong>${order.start_date}</strong> est maintenant 100% garantie ! 🎉
        </p>

        ${invoiceButtonHtml}

        <!-- Section Event -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #333333; line-height: 1.6;">
              <tr>
                <td width="30%" style="padding-bottom: 8px; color: #888888;">Lieu</td>
                <td width="70%" style="padding-bottom: 8px;"><strong>${order.event_location}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Dates</td>
                <td style="padding-bottom: 8px;">Du <strong>${order.start_date}</strong> au <strong>${order.end_date}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Section Matériel -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #F0FDF4; border: 1px solid #D1FAE5; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <p style="margin: 0 0 15px 0; color: #059669; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Matériel réservé</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #111111; line-height: 1.6;">
              ${itemsRows}
            </table>
          </div>
        </div>
                
        <p style="font-size: 15px; color: #555555; line-height: 1.6; text-align: center; margin-top: 30px;">
          Nous vous contacterons très prochainement pour régler les détails logistiques (heure de retrait/livraison).<br>
          Merci de votre confiance ! 🥂
        </p>

      </div>
      
      <div style="background-color: #111111; padding: 25px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">
          L'équipe <strong style="color: #ffffff;">Soirées Ici</strong>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
