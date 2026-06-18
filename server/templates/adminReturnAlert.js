/**
 * Template : Alerte de retour envoyée aux administrateurs.
 * Envoyé quand le matériel n'a pas été confirmé retourné après la date prévue.
 * @param {object} order - Détails de la commande
 * @param {Array} items - Liste des articles
 * @param {string} validationUrl - URL de gestion de la commande
 * @returns {object} {subject, html}
 */
export function adminReturnAlertTemplate(order, items, validationUrl) {
  const itemsList = items.map(item =>
    `<li style="padding: 6px 0; border-bottom: 1px solid #EEEEEE;">${item.quantity}× <strong>${item.equipment_name}</strong></li>`
  ).join('');

  return {
    subject: `⚠️ Retour en attente — Commande #${order.id} (${order.client_name})`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0;">
  <div style="background-color: #FFEAF2; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(255, 0, 127, 0.15);">
      
      <div style="background: linear-gradient(135deg, #FF7A59 0%, #FF4500 100%); padding: 50px 20px; text-align: center;">
        <p style="color: #FFF2F7; margin: 0 0 10px 0; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Alerte automatique ⚠️</p>
        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-family: 'Georgia', serif; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">Retour non confirmé</h2>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px;">
          Le matériel de la commande <strong style="color: #FF007F;">#${order.id}</strong> devait être retourné le <strong style="color: #FF7A59;">${order.end_date}</strong> mais aucun retour n'a été confirmé.
        </p>

        <!-- Section 1 : Client -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #000000; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">📌 Client</div>
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #333333; line-height: 1.6;">
              <tr>
                <td width="30%" style="padding-bottom: 8px; color: #888888;">Nom</td>
                <td width="70%" style="padding-bottom: 8px;"><strong>${order.client_name}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Email</td>
                <td style="padding-bottom: 8px;"><a href="mailto:${order.client_email}" style="color: #FF007F; text-decoration: none; font-weight: bold;">${order.client_email}</a></td>
              </tr>
              <tr>
                <td style="color: #888888;">Téléphone</td>
                <td><a href="tel:${order.client_phone}" style="color: #FF007F; text-decoration: none; font-weight: bold;">${order.client_phone}</a></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Section 2 : Matériel -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #FF007F; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">📦 Matériel en attente</div>
          <div style="background-color: #FFF2F7; border: 1px solid #FFD1E3; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; color: #111111; line-height: 1.6;">
              ${itemsList}
            </ul>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0 10px;">
          <a href="${validationUrl}" style="display: inline-block; background: linear-gradient(90deg, #FF007F, #FF7A59); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(255, 0, 127, 0.2);">
            GÉRER LE RETOUR
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #999999;">Confirmez le retour ou marquez en retard</p>
        
      </div>
      
      <div style="background-color: #111111; padding: 25px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">
          Alerte automatique<br>
          <strong style="color: #ffffff;">Soirées Ici</strong>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
