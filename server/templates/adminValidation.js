/**
 * Template : Lien de validation envoyé aux administrateurs.
 * @param {object} order - Détails de la commande
 * @param {Array} items - Liste des articles
 * @param {string} validationUrl - URL complète de validation
 * @returns {object} {subject, html}
 */
export function adminValidationTemplate(order, items, validationUrl) {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding-bottom: 8px;"><strong>${item.equipment_name}</strong></td>
      <td style="padding-bottom: 8px; color: #FF007F; font-weight: bold; text-align: center;">x${item.quantity}</td>
    </tr>
  `).join('');

  return {
    subject: `🔔 Nouvelle demande de location #${order.id} — Action requise`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0;">
  <div style="background-color: #FFEAF2; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(255, 0, 127, 0.15);">
      
      <div style="background: linear-gradient(135deg, #FF007F 0%, #FF7A59 100%); padding: 50px 20px; text-align: center;">
        <p style="color: #FFEAF2; margin: 0 0 10px 0; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Location de matériel 🪩</p>
        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-family: 'Georgia', serif; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">Nouvelle demande</h2>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px;">
          Hello l'équipe,<br>
          Vous avez reçu une nouvelle demande de devis (Commande #${order.id}) de la part de <strong style="color: #FF007F; font-size: 18px;">${order.client_name}</strong>.
        </p>

        <!-- Section 1 : Client -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #000000; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">📌 Coordonnées</div>
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #333333; line-height: 1.6;">
              <tr>
                <td width="30%" style="padding-bottom: 8px; color: #888888;">Type</td>
                <td width="70%" style="padding-bottom: 8px;"><strong>${order.client_type}</strong></td>
              </tr>
              ${order.client_type === 'ENTREPRISE' ? `
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Société</td>
                <td style="padding-bottom: 8px;"><strong>${order.company_name}</strong></td>
              </tr>
              ${order.vat_number ? `
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">TVA</td>
                <td style="padding-bottom: 8px;"><strong>${order.vat_number}</strong></td>
              </tr>` : ''}` : ''}
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Nom</td>
                <td style="padding-bottom: 8px;"><strong>${order.client_name}</strong></td>
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

        <!-- Section 2 : Event -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #000000; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">📅 L'Événement</div>
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #333333; line-height: 1.6;">
              <tr>
                <td width="30%" style="padding-bottom: 8px; color: #888888;">Type</td>
                <td width="70%" style="padding-bottom: 8px; text-transform: capitalize;"><strong>${order.event_type} ${order.event_type_other ? `(${order.event_type_other})` : ''}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Lieu</td>
                <td style="padding-bottom: 8px;"><strong>${order.event_location}</strong></td>
              </tr>
              <tr>
                <td style="padding-bottom: 8px; color: #888888;">Du</td>
                <td style="padding-bottom: 8px;"><strong>${order.start_date}</strong></td>
              </tr>
              <tr>
                <td style="color: #888888;">Au</td>
                <td><strong>${order.end_date}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Section 3 : Matériel -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #FF007F; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">📦 Matériel souhaité</div>
          <div style="background-color: #FFF2F7; border: 1px solid #FFD1E3; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 15px; color: #111111; line-height: 1.6;">
              ${itemsRows}
            </table>
          </div>
        </div>

        ${order.notes ? `
        <!-- Section 4 : Remarques -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #000000; color: #ffffff; display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -15px; position: relative; z-index: 10;">💬 Remarques</div>
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px;">
            <p style="margin: 0; font-size: 15px; color: #555555; font-style: italic; white-space: pre-line; line-height: 1.6;">
              ${order.notes}
            </p>
          </div>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0 10px;">
          <a href="${validationUrl}" style="display: inline-block; background: linear-gradient(90deg, #FF007F, #FF7A59); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(255, 0, 127, 0.2);">
            TRAITER LA DEMANDE
          </a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #999999;">Lien sécurisé (ne pas partager)</p>
        
      </div>
      
      <div style="background-color: #111111; padding: 25px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">
          Panneau d'administration<br>
          <strong style="color: #ffffff;">Soirées Ici</strong>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
