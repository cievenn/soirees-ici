/**
 * Template : Remerciement envoyé au client après retour du matériel.
 * @param {object} order - Détails de la commande
 * @returns {object} {subject, html}
 */
export function clientThankYouTemplate(order) {
  return {
    subject: `🙏 Merci pour votre confiance — Soirées Ici (#${order.id})`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0;">
  <div style="background-color: #FFEAF2; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(255, 0, 127, 0.15);">
      
      <div style="background: linear-gradient(135deg, #FF007F 0%, #FF7A59 100%); padding: 50px 20px; text-align: center;">
        <span style="font-size: 48px; display: block; margin-bottom: 8px;">🎉</span>
        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-family: 'Georgia', serif; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">Merci beaucoup !</h2>
      </div>
      
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.6; color: #111111; margin-top: 0; margin-bottom: 30px; text-align: center;">
          Bonjour <strong style="color: #FF007F; font-size: 18px;">${order.client_name}</strong>,<br><br>
          Le retour de votre matériel pour la commande <strong style="color: #FF7A59;">#${order.id}</strong> a bien été confirmé.<br>
          Tout est en ordre ! 🎊
        </p>

        <!-- Message -->
        <div style="margin-bottom: 25px;">
          <div style="background-color: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 25px 20px 20px 20px; text-align: center;">
            <p style="margin: 0; font-size: 15px; color: #333333; line-height: 1.6;">
              Nous espérons que notre matériel a contribué au succès de votre événement !<br>
              N'hésitez pas à refaire appel à nous pour vos prochains projets. 💪
            </p>
          </div>
        </div>

        <!-- Social Links -->
        <div style="text-align: center; margin: 40px 0 10px;">
          <p style="color: #888888; font-size: 13px; margin: 0 0 16px;">Suivez-nous pour ne rien rater :</p>
          <div>
            <a href="https://www.instagram.com/soirees_ici/" style="display: inline-block; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); color: white; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: bold; margin: 0 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📸 Instagram</a>
            <a href="https://www.facebook.com/soireesici" style="display: inline-block; background: #1877f2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: bold; margin: 0 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">👍 Facebook</a>
          </div>
        </div>
        
      </div>
      
      <div style="background-color: #111111; padding: 25px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">
          À bientôt ! 🎶<br>
          <strong style="color: #ffffff;">Soirées Ici</strong>
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`
  };
}
