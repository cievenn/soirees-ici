import { Router } from 'express';
import { getAllEquipmentWithStock, updateStockTotal } from '../services/stockService.js';
import { getDb } from '../db/database.js';

const router = Router();

// ============================================================
// GET /api/equipment — Liste tout l'équipement avec stock
// Accepte des query params optionnels start_date et end_date
// pour calculer la disponibilité sur une période spécifique.
// ============================================================
router.get('/', (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Valider les dates si fournies
    if ((start_date && !end_date) || (!start_date && end_date)) {
      return res.status(400).json({ error: 'Les deux dates (start_date et end_date) doivent être fournies ensemble.' });
    }

    if (start_date && end_date) {
      // Vérification basique du format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
        return res.status(400).json({ error: 'Format de date invalide. Utilisez YYYY-MM-DD.' });
      }
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début.' });
      }
    }

    const equipment = getAllEquipmentWithStock(start_date || null, end_date || null);
    res.json({ success: true, equipment });
  } catch (error) {
    console.error('Erreur récupération équipement:', error);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// ============================================================
// PUT /api/equipment/:id/stock — Modifier le stock total
// (protégé par token admin dans un usage réel)
// ============================================================
router.put('/:id/stock', (req, res) => {
  try {
    const { id } = req.params;
    const { stock_total } = req.body;

    if (typeof stock_total !== 'number' || stock_total < 0) {
      return res.status(400).json({ error: 'Le stock total doit être un nombre positif.' });
    }

    updateStockTotal(parseInt(id, 10), stock_total);

    const db = getDb();
    db.prepare(`
      INSERT INTO audit_log (action, details, ip_address)
      VALUES ('STOCK_UPDATED', ?, ?)
    `).run(`Stock de l'équipement #${id} mis à jour: ${stock_total}`, req.ip);

    res.json({ success: true, message: 'Stock mis à jour.' });

  } catch (error) {
    console.error('Erreur mise à jour stock:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la mise à jour du stock.' });
  }
});

export default router;
