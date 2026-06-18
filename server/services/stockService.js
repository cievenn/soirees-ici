import { getDb } from '../db/database.js';

/**
 * Vérifie que tout le stock est disponible pour une commande donnée.
 * @param {Array} items - [{equipment_id, quantity}]
 * @returns {{available: boolean, unavailable: Array}} Résultat de la vérification
 */
export function checkStockAvailability(items) {
  const db = getDb();
  const unavailable = [];

  for (const item of items) {
    const equipment = db.prepare(`
      SELECT id, name, stock_total, stock_reserved,
             (stock_total - stock_reserved) as stock_available
      FROM equipment WHERE id = ?
    `).get(item.equipment_id);

    if (!equipment) {
      unavailable.push({
        equipment_id: item.equipment_id,
        reason: 'Équipement introuvable'
      });
      continue;
    }

    if (equipment.stock_available < item.quantity) {
      unavailable.push({
        equipment_id: item.equipment_id,
        name: equipment.name,
        requested: item.quantity,
        available: equipment.stock_available,
        reason: `Stock insuffisant: ${equipment.stock_available} disponible(s), ${item.quantity} demandé(s)`
      });
    }
  }

  return {
    available: unavailable.length === 0,
    unavailable
  };
}

/**
 * Réserve le stock pour une commande approuvée.
 * Opération transactionnelle : tout ou rien.
 * @param {number} orderId - ID de la commande
 * @throws {Error} Si le stock est insuffisant
 */
export function reserveStock(orderId) {
  const db = getDb();

  const transaction = db.transaction(() => {
    const items = db.prepare(`
      SELECT oi.equipment_id, oi.quantity, e.name, e.stock_total, e.stock_reserved,
             (e.stock_total - e.stock_reserved) as stock_available
      FROM order_items oi
      JOIN equipment e ON e.id = oi.equipment_id
      WHERE oi.order_id = ?
    `).all(orderId);

    // Vérification anti-surbooking
    for (const item of items) {
      if (item.stock_available < item.quantity) {
        throw new Error(
          `Stock insuffisant pour "${item.name}": ${item.stock_available} disponible(s), ${item.quantity} demandé(s)`
        );
      }
    }

    // Réservation du stock
    const updateStmt = db.prepare(`
      UPDATE equipment
      SET stock_reserved = stock_reserved + ?
      WHERE id = ?
    `);

    for (const item of items) {
      updateStmt.run(item.quantity, item.equipment_id);
    }

    return items;
  });

  return transaction();
}

/**
 * Libère le stock réservé (annulation ou retour du matériel).
 * @param {number} orderId - ID de la commande
 */
export function releaseStock(orderId) {
  const db = getDb();

  const transaction = db.transaction(() => {
    const items = db.prepare(`
      SELECT oi.equipment_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = ?
    `).all(orderId);

    const updateStmt = db.prepare(`
      UPDATE equipment
      SET stock_reserved = MAX(0, stock_reserved - ?)
      WHERE id = ?
    `);

    for (const item of items) {
      updateStmt.run(item.quantity, item.equipment_id);
    }

    return items;
  });

  return transaction();
}

/**
 * Récupère le stock complet avec disponibilité calculée.
 * @returns {Array} Liste des équipements avec stock_available
 */
export function getAllEquipmentWithStock() {
  const db = getDb();
  return db.prepare(`
    SELECT id, name, price, caution, image, stock_total, stock_reserved,
           (stock_total - stock_reserved) as stock_available
    FROM equipment
    ORDER BY id
  `).all();
}

/**
 * Met à jour le stock total d'un équipement.
 * @param {number} equipmentId - ID de l'équipement
 * @param {number} newTotal - Nouveau stock total
 */
export function updateStockTotal(equipmentId, newTotal) {
  const db = getDb();

  const equipment = db.prepare('SELECT stock_reserved FROM equipment WHERE id = ?').get(equipmentId);
  if (!equipment) throw new Error('Équipement introuvable');
  if (newTotal < equipment.stock_reserved) {
    throw new Error(`Impossible de réduire le stock en dessous des réservations en cours (${equipment.stock_reserved})`);
  }

  db.prepare('UPDATE equipment SET stock_total = ? WHERE id = ?').run(newTotal, equipmentId);
}
