import crypto from 'crypto';

/**
 * Génère un token cryptographique sécurisé de 64 caractères.
 * Utilise crypto.randomBytes pour garantir l'unicité et l'imprévisibilité.
 * @returns {string} Token hexadécimal de 64 caractères
 */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Valide un couple ID + token contre la base de données.
 * @param {object} db - Instance de la base de données
 * @param {number} orderId - ID de la commande
 * @param {string} token - Token secret
 * @returns {object|null} La commande si valide, null sinon
 */
export function validateToken(db, orderId, token) {
  if (!orderId || !token || typeof token !== 'string' || token.length !== 64) {
    return null;
  }

  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ? AND token_secret = ?
  `).get(orderId, token);

  return order || null;
}

/**
 * Marque un token comme utilisé (première action admin effectuée).
 * Le token reste valide pour consultation mais est flaggé.
 * @param {object} db - Instance de la base de données
 * @param {number} orderId - ID de la commande
 */
export function markTokenUsed(db, orderId) {
  db.prepare(`
    UPDATE orders SET token_used = 1, updated_at = datetime('now') WHERE id = ?
  `).run(orderId);
}

/**
 * Vérifie si la fenêtre de modification de 24h est encore active.
 * @param {object} order - La commande avec modification_deadline
 * @returns {boolean} true si modification possible
 */
export function isWithinModificationWindow(order) {
  if (!order.modification_deadline) return false;
  const deadline = new Date(order.modification_deadline + 'Z');
  return new Date() < deadline;
}
