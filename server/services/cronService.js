import cron from 'node-cron';
import { getDb } from '../db/database.js';
import { sendAdminReturnAlert } from './emailService.js';

/**
 * Initialise le cron job de vérification des retours.
 * S'exécute toutes les heures pour vérifier les commandes ACTIVE
 * dont la date de retour est dépassée de plus de 24h.
 */
export function initCronJobs() {
  // Toutes les heures à la minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Cron: Vérification des retours en attente...');
    await checkOverdueReturns();
  });

  console.log('⏰ Cron jobs initialisés (vérification retours: toutes les heures)');
}

/**
 * Vérifie les commandes ACTIVE dont la date de retour est dépassée de 24h+.
 * Envoie un email d'alerte aux administrateurs.
 * Ne modifie JAMAIS le stock ou le statut automatiquement.
 */
async function checkOverdueReturns() {
  try {
    const db = getDb();

    // Commandes ACTIVE dont end_date + 24h < maintenant
    // Et qui n'ont pas encore reçu d'alerte (on utilise un flag dans audit_log)
    const overdueOrders = db.prepare(`
      SELECT o.*
      FROM orders o
      WHERE o.status = 'ACTIVE'
        AND datetime(o.end_date, '+1 day') < datetime('now')
        AND o.id NOT IN (
          SELECT DISTINCT order_id FROM audit_log
          WHERE action = 'RETURN_ALERT_SENT'
          AND order_id IS NOT NULL
        )
    `).all();

    if (overdueOrders.length === 0) {
      console.log('⏰ Cron: Aucun retour en attente');
      return;
    }

    console.log(`⏰ Cron: ${overdueOrders.length} commande(s) en attente de retour`);

    for (const order of overdueOrders) {
      const items = db.prepare(`
        SELECT oi.*, e.name as equipment_name
        FROM order_items oi
        JOIN equipment e ON e.id = oi.equipment_id
        WHERE oi.order_id = ?
      `).all(order.id);

      try {
        await sendAdminReturnAlert(order, items);

        // Log l'envoi de l'alerte pour ne pas la renvoyer
        db.prepare(`
          INSERT INTO audit_log (order_id, action, details)
          VALUES (?, 'RETURN_ALERT_SENT', ?)
        `).run(order.id, `Alerte retour envoyée — date fin prévue: ${order.end_date}`);

        console.log(`📧 Alerte retour envoyée pour la commande #${order.id}`);
      } catch (emailErr) {
        console.error(`❌ Erreur envoi alerte retour commande #${order.id}:`, emailErr.message);
      }
    }
  } catch (error) {
    console.error('❌ Erreur cron checkOverdueReturns:', error.message);
  }
}
