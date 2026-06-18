/**
 * Template : Alerte Admin suite au paiement validé d'un client.
 * @param {object} order - Détails de la commande
 * @param {Array} items - Liste des articles
 * @param {string} adminUrl - URL vers le dashboard / validation
 * @returns {object} {subject, html}
 */
export function adminPaymentAlertTemplate(order, items, adminUrl) {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding-bottom: 8px;"><strong>${item.equipment_name}</strong></td>
      <td style="padding-bottom: 8px; color: #10B981; font-weight: bold; text-align: right;">x${item.quantity}</td>
    </tr>
  `).join('');

  return {
    subject: `💰 Paiement reçu ! Commande #${order.id} confirmée (${order.client_name})`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0;">
  <div style="background-color: #F8FAFC; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);">
      
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 50px 20px; text-align: center;">
        <p style="color: #DBEAFE; margin: 0 0 10px 0; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Notification Admin 🛡️</p>
        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-family: 'Georgia', serif; font-weight: bold;">Nouveau Paiement Reçu</h2>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px; text-align: center;">
          Bonne nouvelle ! Le client <strong style="color: #3B82F6; font-size: 18px;">${order.client_name}</strong> vient de procéder au paiement de sa commande (#${order.id}).<br>
          La réservation est désormais <strong>définitivement validée</strong> et le statut est passé en "Approuvée".
        </p>

        <div style="margin-bottom: 25px;">
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #333333; line-height: 1.6;">
              <tr>
                <td width="30%" style="padding-bottom: 8px; color: #64748B;">Client</td>
                <td width="70%" style="padding-bottom: 8px;"><strong>${order.client_name}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #64748B;">Lieu</td>
                <td style="padding-bottom: 8px;"><strong>${order.event_location}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #64748B;">Dates</td>
                <td style="padding-bottom: 8px;">Du <strong>${order.start_date}</strong> au <strong>${order.end_date}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="background-color: #F0FDF4; border: 1px solid #D1FAE5; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <p style="margin: 0 0 15px 0; color: #059669; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Matériel à préparer</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #111111; line-height: 1.6;">
              ${itemsRows}
            </table>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0 10px;">
          <a href="${adminUrl}" style="display: inline-block; background: #111111; color: white; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-size: 15px; font-weight: bold; letter-spacing: 1px;">
            VOIR LA COMMANDE
          </a>
        </div>

      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
