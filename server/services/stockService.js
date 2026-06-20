import { getDb } from '../db/database.js';

/**
 * Calcule la quantité réservée pour un équipement donné sur une période,
 * en sommant les quantités des commandes actives qui chevauchent les dates.
 * 
 * Chevauchement : deux intervalles [A, B] et [C, D] se chevauchent si A < D ET C < B
 * (on utilise < strict pour permettre retour le matin / pickup le soir le même jour)
 * 
 * Statuts qui bloquent le stock : AWAITING_PAYMENT, APPROVED, ACTIVE
 * 
 * @param {number} equipmentId
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string} endDate - ISO date string (YYYY-MM-DD)
 * @param {number|null} excludeOrderId - Exclure cette commande (pour édition)
 * @returns {number} Quantité maximale réservée sur la période
 */
function getReservedQuantity(equipmentId, startDate, endDate, excludeOrderId = null) {
  const db = getDb();

  const query = `
    SELECT COALESCE(SUM(oi.quantity), 0) as total_reserved
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.equipment_id = ?
      AND o.status IN ('AWAITING_PAYMENT', 'APPROVED', 'ACTIVE')
      AND o.start_date <= ?
      AND o.end_date >= ?
      ${excludeOrderId ? 'AND o.id != ?' : ''}
  `;

  const params = excludeOrderId
    ? [equipmentId, endDate, startDate, excludeOrderId]
    : [equipmentId, endDate, startDate];

  const result = db.prepare(query).get(...params);
  return result.total_reserved;
}

/**
 * Vérifie que tout le stock est disponible pour une commande donnée sur une période.
 * @param {Array} items - [{equipment_id, quantity}]
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string} endDate - ISO date string (YYYY-MM-DD)
 * @param {number|null} excludeOrderId - Exclure cette commande (pour édition)
 * @returns {{available: boolean, unavailable: Array}} Résultat de la vérification
 */
export function checkStockAvailability(items, startDate, endDate, excludeOrderId = null) {
  const db = getDb();
  const unavailable = [];

  for (const item of items) {
    const equipment = db.prepare(`
      SELECT id, name, stock_total
      FROM equipment WHERE id = ?
    `).get(item.equipment_id);

    if (!equipment) {
      unavailable.push({
        equipment_id: item.equipment_id,
        reason: 'Équipement introuvable'
      });
      continue;
    }

    const reserved = getReservedQuantity(equipment.id, startDate, endDate, excludeOrderId);
    const available = equipment.stock_total - reserved;

    if (available < item.quantity) {
      unavailable.push({
        equipment_id: item.equipment_id,
        name: equipment.name,
        requested: item.quantity,
        available: Math.max(0, available),
        reason: `Stock insuffisant pour la période du ${startDate} au ${endDate}: ${Math.max(0, available)} disponible(s), ${item.quantity} demandé(s)`
      });
    }
  }

  return {
    available: unavailable.length === 0,
    unavailable
  };
}

/**
 * Récupère le stock complet avec disponibilité calculée.
 * Si des dates sont fournies, la disponibilité est calculée dynamiquement
 * en fonction des commandes qui chevauchent la période.
 * Sans dates, retourne stock_total comme disponible (vue catalogue).
 * 
 * @param {string|null} startDate - Date de début optionnelle (YYYY-MM-DD)
 * @param {string|null} endDate - Date de fin optionnelle (YYYY-MM-DD)
 * @returns {Array} Liste des équipements avec stock_available
 */
export function getAllEquipmentWithStock(startDate = null, endDate = null) {
  const db = getDb();

  const equipments = db.prepare(`
    SELECT id, name, price, price_cents, caution, caution_cents, image, stock_total
    FROM equipment
    ORDER BY id
  `).all();

  if (startDate && endDate) {
    // Calculer la disponibilité dynamiquement pour chaque équipement
    return equipments.map(eq => {
      const reserved = getReservedQuantity(eq.id, startDate, endDate);
      return {
        ...eq,
        stock_reserved: reserved,
        stock_available: Math.max(0, eq.stock_total - reserved)
      };
    });
  }

  // Sans dates : vue catalogue, tout est potentiellement disponible
  return equipments.map(eq => ({
    ...eq,
    stock_reserved: 0,
    stock_available: eq.stock_total
  }));
}

/**
 * Met à jour le stock total d'un équipement.
 * @param {number} equipmentId - ID de l'équipement
 * @param {number} newTotal - Nouveau stock total
 */
export function updateStockTotal(equipmentId, newTotal) {
  const db = getDb();

  const equipment = db.prepare('SELECT id FROM equipment WHERE id = ?').get(equipmentId);
  if (!equipment) throw new Error('Équipement introuvable');
  if (newTotal < 0) throw new Error('Le stock total ne peut pas être négatif');

  db.prepare('UPDATE equipment SET stock_total = ? WHERE id = ?').run(newTotal, equipmentId);
}
