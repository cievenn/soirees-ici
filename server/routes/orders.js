import { Router } from 'express';
import { getDb } from '../db/database.js';
import { generateToken, validateToken, markTokenUsed, isWithinModificationWindow } from '../services/tokenService.js';
import { checkStockAvailability, reserveStock, releaseStock } from '../services/stockService.js';
import { sendClientConfirmation, sendAdminValidation, sendClientThankYou, sendPaymentLink } from '../services/emailService.js';
import { createCheckoutSession } from '../services/stripeService.js';

const router = Router();

// ============================================================
// POST /api/orders — Créer une commande (client)
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { client_name, client_email, client_phone, event_location, start_date, end_date, notes, items } = req.body;

    // Validation des champs requis
    if (!client_name || !client_email || !client_phone || !event_location || !start_date || !end_date) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide.' });
    }

    // Validation des dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début.' });
    }

    const db = getDb();

    // Vérifier que les équipements existent
    const equipmentIds = items.map(i => i.equipment_id);
    const placeholders = equipmentIds.map(() => '?').join(',');
    const equipments = db.prepare(`SELECT * FROM equipment WHERE id IN (${placeholders})`).all(...equipmentIds);

    if (equipments.length !== items.length) {
      return res.status(400).json({ error: 'Un ou plusieurs articles du panier sont invalides.' });
    }

    // Générer le token sécurisé
    const tokenSecret = generateToken();

    // Créer la commande et les items dans une transaction
    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(`
        INSERT INTO orders (status, token_secret, client_name, client_email, client_phone, event_location, start_date, end_date, notes)
        VALUES ('PENDING', ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(tokenSecret, client_name, client_email, client_phone, event_location, start_date, end_date, notes || '');

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, equipment_id, equipment_name, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `);

      const orderItems = [];
      for (const item of items) {
        const equip = equipments.find(e => e.id === item.equipment_id);
        insertItem.run(orderId, item.equipment_id, equip.name, item.quantity, equip.price);
        orderItems.push({
          equipment_id: item.equipment_id,
          equipment_name: equip.name,
          quantity: item.quantity,
          unit_price: equip.price
        });
      }

      // Audit log
      db.prepare(`
        INSERT INTO audit_log (order_id, action, details, ip_address)
        VALUES (?, 'ORDER_CREATED', ?, ?)
      `).run(orderId, `Commande créée par ${client_name} (${client_email})`, req.ip);

      return { orderId, orderItems };
    });

    const { orderId, orderItems } = createOrder();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    // Envoyer les emails (async, ne bloque pas la réponse)
    sendClientConfirmation(order, orderItems).catch(err => console.error('Email client:', err.message));
    sendAdminValidation(order, orderItems).catch(err => console.error('Email admin:', err.message));

    res.status(201).json({
      success: true,
      message: 'Votre demande de location a bien été enregistrée.',
      order_id: orderId
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: 'Erreur interne lors de la création de la commande.' });
  }
});

// ============================================================
// GET /api/orders/:id/validate — Vérifier token admin
// ============================================================
router.get('/:id/validate', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!id || !token) {
      return res.status(400).json({ error: 'Paramètres manquants.' });
    }

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) {
      return res.status(403).json({ error: 'Accès refusé. Token invalide ou commande inexistante.' });
    }

    // Récupérer les items de la commande
    const items = db.prepare(`
      SELECT oi.*, e.name as equipment_name, e.image, e.stock_total, e.stock_reserved,
             (e.stock_total - e.stock_reserved) as stock_available
      FROM order_items oi
      JOIN equipment e ON e.id = oi.equipment_id
      WHERE oi.order_id = ?
    `).all(order.id);

    // Vérifier si dans la fenêtre de modification
    const canModify = order.status === 'APPROVED' && isWithinModificationWindow(order);

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        client_name: order.client_name,
        client_email: order.client_email,
        client_phone: order.client_phone,
        event_location: order.event_location,
        start_date: order.start_date,
        end_date: order.end_date,
        notes: order.notes,
        created_at: order.created_at,
        approved_at: order.approved_at,
        modification_deadline: order.modification_deadline,
        payment_deadline: order.payment_deadline,
        pickup_date: order.pickup_date,
        return_date: order.return_date,
        token_used: !!order.token_used,
      },
      items,
      canModify,
    });

  } catch (error) {
    console.error('Erreur validation token:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/approve — Approuver la commande (et générer lien de paiement)
// ============================================================
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: `Impossible d'approuver une commande en statut "${order.status}".` });
    }

    // Vérifier le stock
    const items = db.prepare(`
      SELECT oi.equipment_id, oi.equipment_name, oi.quantity, e.price_cents 
      FROM order_items oi
      JOIN equipment e ON e.id = oi.equipment_id
      WHERE oi.order_id = ?
    `).all(order.id);

    const stockCheck = checkStockAvailability(items);
    if (!stockCheck.available) {
      return res.status(409).json({
        error: 'Stock insuffisant pour un ou plusieurs articles.',
        details: stockCheck.unavailable
      });
    }

    // Générer la session Stripe Checkout
    const session = await createCheckoutSession(order, items);

    // Transaction : réserver le stock et mettre à jour la commande
    const approve = db.transaction(() => {
      reserveStock(order.id);

      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];

      db.prepare(`
        UPDATE orders SET status = 'AWAITING_PAYMENT', stripe_session_id = ?, payment_deadline = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(session.sessionId, deadline, order.id);

      markTokenUsed(db, order.id);

      db.prepare(`
        INSERT INTO audit_log (order_id, action, details, ip_address)
        VALUES (?, 'ORDER_APPROVED_AWAITING_PAYMENT', ?, ?)
      `).run(order.id, `Commande approuvée, en attente de paiement. Deadline: ${deadline}`, req.ip);

      return deadline;
    });

    const deadline = approve();

    // Envoyer l'email avec le lien de paiement
    // Formater la deadline pour l'email
    const deadlineDate = new Date(deadline + 'Z');
    const deadlineStr = deadlineDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    sendPaymentLink(order, items, session.url, deadlineStr).catch(err => console.error('Email de paiement:', err.message));

    res.json({ success: true, message: 'Commande approuvée. Lien de paiement généré et envoyé au client. Stock réservé temporairement.' });

  } catch (error) {
    console.error('Erreur approbation:', error);
    res.status(500).json({ error: error.message || 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/reject — Rejeter la commande
// ============================================================
router.put('/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: `Impossible de rejeter une commande en statut "${order.status}".` });
    }

    db.prepare(`UPDATE orders SET status = 'REJECTED', updated_at = datetime('now') WHERE id = ?`).run(order.id);
    markTokenUsed(db, order.id);

    db.prepare(`
      INSERT INTO audit_log (order_id, action, details, ip_address)
      VALUES (?, 'ORDER_REJECTED', 'Commande rejetée par l''administrateur', ?)
    `).run(order.id, req.ip);

    res.json({ success: true, message: 'Commande rejetée.' });

  } catch (error) {
    console.error('Erreur rejet:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/cancel — Annuler l'approbation (24h)
// ============================================================
router.put('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    if (order.status !== 'APPROVED') {
      return res.status(400).json({ error: `Impossible d'annuler une commande en statut "${order.status}".` });
    }

    if (!isWithinModificationWindow(order)) {
      return res.status(400).json({ error: 'La fenêtre de modification de 24h est expirée.' });
    }

    // Transaction : libérer le stock et remettre en PENDING
    const cancel = db.transaction(() => {
      releaseStock(order.id);

      db.prepare(`
        UPDATE orders SET status = 'PENDING', approved_at = NULL, modification_deadline = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).run(order.id);

      db.prepare(`
        INSERT INTO audit_log (order_id, action, details, ip_address)
        VALUES (?, 'ORDER_CANCELLED', 'Approbation annulée dans la fenêtre de 24h', ?)
      `).run(order.id, req.ip);
    });

    cancel();

    res.json({ success: true, message: 'Approbation annulée. Stock libéré. La commande repasse en attente.' });

  } catch (error) {
    console.error('Erreur annulation:', error);
    res.status(500).json({ error: error.message || 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/pickup — Confirmer le retrait
// ============================================================
router.put('/:id/pickup', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    if (order.status !== 'APPROVED') {
      return res.status(400).json({ error: `Le retrait n'est possible que pour une commande approuvée (statut actuel: "${order.status}").` });
    }

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare(`
      UPDATE orders SET status = 'ACTIVE', pickup_date = ?, updated_at = datetime('now') WHERE id = ?
    `).run(now, order.id);

    db.prepare(`
      INSERT INTO audit_log (order_id, action, details, ip_address)
      VALUES (?, 'ORDER_PICKUP', ?, ?)
    `).run(order.id, `Matériel retiré le ${now}`, req.ip);

    res.json({ success: true, message: 'Retrait confirmé. Le matériel est considéré comme sorti.' });

  } catch (error) {
    console.error('Erreur retrait:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/return — Confirmer le retour
// ============================================================
router.put('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    if (order.status !== 'ACTIVE' && order.status !== 'OVERDUE') {
      return res.status(400).json({ error: `Le retour n'est possible que pour une commande active ou en retard (statut actuel: "${order.status}").` });
    }

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    // Transaction : libérer le stock et marquer comme retourné
    const returnOrder = db.transaction(() => {
      releaseStock(order.id);

      db.prepare(`
        UPDATE orders SET status = 'RETURNED', return_date = ?, updated_at = datetime('now') WHERE id = ?
      `).run(now, order.id);

      db.prepare(`
        INSERT INTO audit_log (order_id, action, details, ip_address)
        VALUES (?, 'ORDER_RETURNED', ?, ?)
      `).run(order.id, `Matériel retourné le ${now}. Stock réintégré.`, req.ip);
    });

    returnOrder();

    // Envoyer email de remerciement au client
    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    sendClientThankYou(updatedOrder).catch(err => console.error('Email remerciement:', err.message));

    res.json({ success: true, message: 'Retour confirmé. Stock réintégré. Email de remerciement envoyé au client.' });

  } catch (error) {
    console.error('Erreur retour:', error);
    res.status(500).json({ error: error.message || 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/orders/:id/overdue — Marquer en retard
// ============================================================
router.put('/:id/overdue', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    if (order.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Seule une commande active peut être marquée en retard (statut actuel: "${order.status}").` });
    }

    db.prepare(`UPDATE orders SET status = 'OVERDUE', updated_at = datetime('now') WHERE id = ?`).run(order.id);

    db.prepare(`
      INSERT INTO audit_log (order_id, action, details, ip_address)
      VALUES (?, 'ORDER_OVERDUE', 'Commande marquée en retard. Stock reste bloqué.', ?)
    `).run(order.id, req.ip);

    res.json({ success: true, message: 'Commande marquée en retard. Le stock reste réservé jusqu\'au retour réel.' });

  } catch (error) {
    console.error('Erreur overdue:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// GET /api/orders/:id/audit — Historique d'audit
// ============================================================
router.get('/:id/audit', (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const db = getDb();
    const order = validateToken(db, parseInt(id, 10), token);

    if (!order) return res.status(403).json({ error: 'Accès refusé.' });

    const auditLog = db.prepare(`
      SELECT action, details, performed_at FROM audit_log
      WHERE order_id = ?
      ORDER BY performed_at ASC
    `).all(order.id);

    res.json({ success: true, audit: auditLog });

  } catch (error) {
    console.error('Erreur audit:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

export default router;
